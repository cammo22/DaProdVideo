//! Il motore NVIDIA per la voce (NeMo-Speech.cpp): un programma a parte che gira sul computer di chi monta, con i
//! modelli GGUF di NVIDIA. Serve a due cose: i sottotitoli con Nemotron 3.5 (riconoscimento del parlato, streaming) e
//! il cambio voce con Magpie TTS. Va su scheda NVIDIA (CUDA) quando c'è, su Apple Silicon (Metal) e anche solo su CPU.
//!
//! Qui c'è solo I/O, come nel resto del lato Rust: scaricare il programma dalla release di NVIDIA (con il `curl` del
//! sistema, come gli aggiornamenti), estrarlo, lanciarlo e restare a guardare cosa scrive; la logica sta nel JavaScript
//! (src/media/nemo.ts), che chiede i progressi a intervalli invece di aspettare eventi.
//! I modelli li scarica il programma stesso (`nemo-speech pull`), nella cartella che gli diciamo noi: così si può misurare.

use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex, OnceLock};

/// La versione del motore. La 0.1.0 non aveva i programmi pronti da scaricare (nessun archivio nella release): l'app
/// chiedeva un file che non c'era e i sottotitoli NVIDIA finivano in "lo scarico non è riuscito". Dalla 0.2.0 ci sono.
const VERSIONE: &str = "0.2.0";
const RELEASE: &str = "https://github.com/NVIDIA/NeMo-Speech.cpp/releases/download/";

fn senza_finestra(c: &mut Command) -> &mut Command {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        // CREATE_NO_WINDOW: niente finestra nera del prompt
        c.creation_flags(0x0800_0000);
    }
    c
}

/// Il nome del sistema come lo chiama NVIDIA negli archivi.
pub fn nome_sistema() -> &'static str {
    if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else {
        "linux"
    }
}

pub fn nome_architettura() -> &'static str {
    if cfg!(target_arch = "aarch64") {
        "aarch64"
    } else {
        "x86_64"
    }
}

/// Il nome dell'archivio da scaricare per un backend (cpu, cuda, vulkan, metal), o None se per questo sistema non c'è.
pub fn nome_archivio(backend: &str) -> Option<String> {
    let os = nome_sistema();
    let arch = nome_architettura();
    let ok = match (os, arch, backend) {
        ("windows", "x86_64", "cpu" | "cuda" | "vulkan") => true,
        ("linux", "x86_64", "cpu" | "cuda" | "vulkan") => true,
        ("linux", "aarch64", "cpu") => true,
        ("macos", "aarch64", "metal" | "cpu") => true,
        ("macos", "x86_64", "cpu") => true,
        _ => false,
    };
    if !ok {
        return None;
    }
    let est = if os == "windows" { "zip" } else { "tar.gz" };
    Some(format!("nemo-speech-{VERSIONE}-{os}-{arch}-{backend}.{est}"))
}

fn indirizzo(backend: &str) -> Option<String> {
    nome_archivio(backend).map(|n| format!("{RELEASE}v{VERSIONE}/{n}"))
}

/// Il backend che conviene: CUDA se c'è una scheda NVIDIA, Metal su Apple Silicon, altrimenti CPU.
pub fn backend_consigliato(nvidia: bool) -> &'static str {
    if cfg!(target_os = "macos") {
        if cfg!(target_arch = "aarch64") {
            "metal"
        } else {
            "cpu"
        }
    } else if nvidia && nome_archivio("cuda").is_some() {
        "cuda"
    } else {
        "cpu"
    }
}

/// Cerca `nemo-speech` (o `.exe`) dentro una cartella, scendendo al massimo di quattro livelli.
pub fn cerca_programma(dir: &Path, livello: u32) -> Option<PathBuf> {
    let nome = if cfg!(target_os = "windows") { "nemo-speech.exe" } else { "nemo-speech" };
    let diretto = dir.join(nome);
    if diretto.is_file() {
        return Some(diretto);
    }
    let dentro = dir.join("bin").join(nome);
    if dentro.is_file() {
        return Some(dentro);
    }
    if livello >= 4 {
        return None;
    }
    for e in std::fs::read_dir(dir).ok()?.flatten() {
        let p = e.path();
        if p.is_dir() {
            if let Some(t) = cerca_programma(&p, livello + 1) {
                return Some(t);
            }
        }
    }
    None
}

/// Quanto pesa una cartella con tutto quello che c'è dentro (per misurare i modelli mentre si scaricano).
pub fn peso_cartella(dir: &Path) -> u64 {
    let mut tot = 0;
    if let Ok(rd) = std::fs::read_dir(dir) {
        for e in rd.flatten() {
            let p = e.path();
            if let Ok(m) = e.metadata() {
                if m.is_dir() {
                    tot += peso_cartella(&p);
                } else {
                    tot += m.len();
                }
            }
        }
    }
    tot
}

/// L'impronta SHA-256 di un file, con gli strumenti del sistema (nessuna libreria in più). None se non si riesce.
pub fn impronta(file: &Path) -> Option<String> {
    let mut c;
    if cfg!(target_os = "windows") {
        c = Command::new("certutil");
        c.arg("-hashfile").arg(file).arg("SHA256");
    } else {
        c = Command::new("shasum");
        c.args(["-a", "256"]).arg(file);
    }
    let o = senza_finestra(&mut c).output().ok()?;
    if !o.status.success() {
        return None;
    }
    let t = String::from_utf8_lossy(&o.stdout).to_string();
    // certutil: l'impronta è sulla seconda riga; shasum: è la prima parola
    let cand = if cfg!(target_os = "windows") { t.lines().nth(1)?.to_string() } else { t.split_whitespace().next()?.to_string() };
    let pulita: String = cand.chars().filter(|c| c.is_ascii_hexdigit()).collect();
    if pulita.len() == 64 {
        Some(pulita.to_lowercase())
    } else {
        None
    }
}

/// Dalla riga di un file `.sha256` (impronta e nome) all'impronta.
pub fn impronta_attesa(testo: &str) -> Option<String> {
    let p = testo.split_whitespace().next()?.to_lowercase();
    if p.len() == 64 && p.chars().all(|c| c.is_ascii_hexdigit()) {
        Some(p)
    } else {
        None
    }
}

// ——— i comandi ———

use serde::Serialize;
use tauri::{AppHandle, Manager};

type Esito<T> = Result<T, String>;

fn cartella_motori(app: &AppHandle) -> Esito<PathBuf> {
    let d = app.path().app_local_data_dir().or_else(|_| app.path().app_data_dir()).map_err(|e| e.to_string())?.join("motori");
    std::fs::create_dir_all(&d).map_err(|e| e.to_string())?;
    Ok(d)
}

fn cartella_modelli(app: &AppHandle) -> Esito<PathBuf> {
    let d = cartella_motori(app)?.join("modelli");
    std::fs::create_dir_all(&d).map_err(|e| e.to_string())?;
    Ok(d)
}

#[derive(Serialize)]
pub struct StatoMotore {
    os: &'static str,
    arch: &'static str,
    /// dove sta tutto (programma, modelli, lavori)
    cartella: String,
    installato: bool,
    backend: String,
    /// il backend che conviene installare qui
    consigliato: String,
    /// c'è una scheda NVIDIA (nvidia-smi risponde)
    nvidia: bool,
    /// quanto pesano i modelli scaricati, in byte
    modelli: u64,
}

fn ha_nvidia() -> bool {
    let mut c = Command::new("nvidia-smi");
    c.arg("-L").stdout(Stdio::null()).stderr(Stdio::null());
    senza_finestra(&mut c).status().map(|s| s.success()).unwrap_or(false)
}

fn backend_installato(dir: &Path) -> Option<String> {
    std::fs::read_to_string(dir.join("installato.txt")).ok().map(|s| s.trim().to_string()).filter(|s| !s.is_empty())
}

/// Com'è messo il motore: c'è o no, con quale backend, dove, e se il computer ha una scheda NVIDIA.
#[tauri::command]
pub async fn motore_stato(app: AppHandle) -> Esito<StatoMotore> {
    let dir = cartella_motori(&app)?;
    let modelli = cartella_modelli(&app)?;
    tauri::async_runtime::spawn_blocking(move || -> Esito<StatoMotore> {
        let programma = cerca_programma(&dir.join("programma"), 0);
        let nvidia = ha_nvidia();
        let backend = backend_installato(&dir);
        Ok(StatoMotore {
            os: nome_sistema(),
            arch: nome_architettura(),
            cartella: dir.to_string_lossy().into_owned(),
            installato: programma.is_some() && backend.is_some(),
            backend: backend.unwrap_or_default(),
            consigliato: backend_consigliato(nvidia).to_string(),
            nvidia,
            modelli: peso_cartella(&modelli),
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Lo stato dello scarico del programma: quanti byte sono arrivati e di quanti (0 = non si sa).
static SCARICO: Mutex<(u64, u64)> = Mutex::new((0, 0));

/// Quanto è arrivato dello scarico in corso: (byte, totale).
#[tauri::command]
pub fn motore_scarico() -> (u64, u64) {
    SCARICO.lock().map(|s| *s).unwrap_or((0, 0))
}

/// Scarica e installa il programma per il backend scelto (cpu, cuda, vulkan, metal). Si controlla l'impronta
/// SHA-256 pubblicata da NVIDIA (se il sistema sa calcolarla). Ritorna il percorso del programma.
#[tauri::command]
pub async fn motore_installa(app: AppHandle, backend: String) -> Esito<String> {
    let url = indirizzo(&backend).ok_or_else(|| format!("per questo computer non c'è la versione {backend}"))?;
    let nome = nome_archivio(&backend).unwrap_or_default();
    let dir = cartella_motori(&app)?;
    tauri::async_runtime::spawn_blocking(move || -> Esito<String> {
        let arc = dir.join(&nome);
        let parziale = dir.join(format!("{nome}.parziale"));
        let _ = std::fs::remove_file(&parziale);
        // quanto pesa: dall'intestazione (l'ultima risposta dopo i reindirizzamenti)
        let mut testa = Command::new("curl");
        testa.args(["-sIL", "-m", "30"]).arg(&url);
        let totale = senza_finestra(&mut testa)
            .output()
            .ok()
            .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
            .and_then(|t| t.lines().filter_map(|l| l.to_lowercase().strip_prefix("content-length:").and_then(|v| v.trim().parse::<u64>().ok())).last())
            .unwrap_or(0);
        if let Ok(mut s) = SCARICO.lock() {
            *s = (0, totale);
        }
        // il file cresce mentre curl lavora: un altro filo lo misura per la barra
        let fine = Arc::new(std::sync::atomic::AtomicBool::new(false));
        let f2 = fine.clone();
        let p2 = parziale.clone();
        let misura = std::thread::spawn(move || {
            while !f2.load(std::sync::atomic::Ordering::Relaxed) {
                if let Ok(m) = std::fs::metadata(&p2) {
                    if let Ok(mut s) = SCARICO.lock() {
                        s.0 = m.len();
                    }
                }
                std::thread::sleep(std::time::Duration::from_millis(250));
            }
        });
        let mut c = Command::new("curl");
        c.args(["-L", "-f", "-s", "--retry", "3", "-o"]).arg(&parziale).arg(&url);
        let esito = senza_finestra(&mut c).status().map_err(|e| format!("curl non parte: {e}"));
        fine.store(true, std::sync::atomic::Ordering::Relaxed);
        let _ = misura.join();
        let stato = esito?;
        if !stato.success() {
            let _ = std::fs::remove_file(&parziale);
            return Err(format!("lo scarico non è riuscito ({stato}): serve internet"));
        }
        // l'impronta pubblicata da NVIDIA
        let mut h = Command::new("curl");
        h.args(["-L", "-f", "-s", "-m", "30"]).arg(format!("{url}.sha256"));
        if let Ok(o) = senza_finestra(&mut h).output() {
            if o.status.success() {
                if let (Some(att), Some(vera)) = (impronta_attesa(&String::from_utf8_lossy(&o.stdout)), impronta(&parziale)) {
                    if att != vera {
                        let _ = std::fs::remove_file(&parziale);
                        return Err("l'archivio scaricato non corrisponde all'impronta di NVIDIA".into());
                    }
                }
            }
        }
        std::fs::rename(&parziale, &arc).map_err(|e| e.to_string())?;
        // si estrae in una cartella nuova (poi si sostituisce quella vecchia)
        let nuova = dir.join("programma.nuovo");
        let _ = std::fs::remove_dir_all(&nuova);
        std::fs::create_dir_all(&nuova).map_err(|e| e.to_string())?;
        // su Windows il tar del sistema (bsdtar) legge anche gli zip; quello di Git no: si chiama per nome
        let tar = if cfg!(target_os = "windows") {
            let root = std::env::var("SystemRoot").unwrap_or_else(|_| "C:\\Windows".into());
            PathBuf::from(root).join("System32").join("tar.exe")
        } else {
            PathBuf::from("tar")
        };
        let mut t = Command::new(tar);
        t.arg("-xf").arg(&arc).arg("-C").arg(&nuova);
        let s = senza_finestra(&mut t).status().map_err(|e| format!("non riesco ad aprire l'archivio: {e}"))?;
        let _ = std::fs::remove_file(&arc);
        if !s.success() {
            return Err(format!("l'archivio non si apre ({s})"));
        }
        let prog = cerca_programma(&nuova, 0).ok_or("nell'archivio non c'è il programma")?;
        let vecchia = dir.join("programma");
        let _ = std::fs::remove_dir_all(&vecchia);
        std::fs::rename(&nuova, &vecchia).map_err(|e| e.to_string())?;
        let finale = cerca_programma(&vecchia, 0).unwrap_or(prog);
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if let Ok(m) = std::fs::metadata(&finale) {
                let mut p = m.permissions();
                p.set_mode(0o755);
                let _ = std::fs::set_permissions(&finale, p);
            }
        }
        std::fs::write(dir.join("installato.txt"), &backend).map_err(|e| e.to_string())?;
        Ok(finale.to_string_lossy().into_owned())
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Un lavoro in corso: il programma lanciato e quello che ha scritto sull'errore standard (dove parla).
struct Lavoro {
    figlio: Arc<Mutex<Option<Child>>>,
    righe: Arc<Mutex<Vec<String>>>,
    /// come è finito (None = ancora in corso); -1 = fermato o morto
    codice: Arc<Mutex<Option<i32>>>,
}

fn lavori() -> &'static Mutex<HashMap<String, Lavoro>> {
    static L: OnceLock<Mutex<HashMap<String, Lavoro>>> = OnceLock::new();
    L.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Lancia il programma con questi argomenti (i modelli vanno nella nostra cartella). Torna subito: si guarda
/// com'è andata con `motore_lavoro`.
#[tauri::command]
pub async fn motore_lancia(app: AppHandle, id: String, args: Vec<String>) -> Esito<()> {
    let dir = cartella_motori(&app)?;
    let modelli = cartella_modelli(&app)?;
    let prog = cerca_programma(&dir.join("programma"), 0).ok_or("il motore non è installato")?;
    let mut c = Command::new(&prog);
    c.args(&args).env("NEMO_SPEECH_MODEL_DIR", &modelli).stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::piped());
    // le librerie stanno accanto al programma
    if let Some(radice) = prog.parent().and_then(|b| b.parent()) {
        let lib = radice.join("lib");
        let bin = prog.parent().map(|p| p.to_path_buf()).unwrap_or_default();
        #[cfg(target_os = "windows")]
        {
            let vecchio = std::env::var("PATH").unwrap_or_default();
            c.env("PATH", format!("{};{};{}", bin.display(), lib.display(), vecchio));
        }
        #[cfg(target_os = "macos")]
        {
            let _ = &bin;
            c.env("DYLD_LIBRARY_PATH", &lib);
        }
        #[cfg(all(unix, not(target_os = "macos")))]
        {
            let _ = &bin;
            c.env("LD_LIBRARY_PATH", &lib);
        }
    }
    let mut figlio = senza_finestra(&mut c).spawn().map_err(|e| format!("il motore non parte: {e}"))?;
    let errore = figlio.stderr.take();
    let righe = Arc::new(Mutex::new(Vec::<String>::new()));
    let codice = Arc::new(Mutex::new(None::<i32>));
    let figlio = Arc::new(Mutex::new(Some(figlio)));
    if let Some(e) = errore {
        let r = righe.clone();
        std::thread::spawn(move || {
            // il programma scrive i progressi con \r: si spezza anche lì
            let mut lettore = BufReader::new(e);
            let mut buf = Vec::new();
            loop {
                buf.clear();
                match lettore.read_until(b'\n', &mut buf) {
                    Ok(0) | Err(_) => break,
                    Ok(_) => {
                        let t = String::from_utf8_lossy(&buf).to_string();
                        for pezzo in t.split(['\r', '\n']) {
                            let p = pezzo.trim();
                            if !p.is_empty() {
                                if let Ok(mut v) = r.lock() {
                                    v.push(p.to_string());
                                    // non più di 400 righe: le più vecchie vanno via
                                    if v.len() > 400 {
                                        v.remove(0);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    // chi aspetta la fine
    {
        let f = figlio.clone();
        let cod = codice.clone();
        std::thread::spawn(move || loop {
            std::thread::sleep(std::time::Duration::from_millis(150));
            let fatto = match f.lock() {
                Ok(mut g) => match g.as_mut() {
                    Some(ch) => match ch.try_wait() {
                        Ok(Some(s)) => Some(s.code().unwrap_or(-1)),
                        Ok(None) => None,
                        Err(_) => Some(-1),
                    },
                    None => Some(-1),
                },
                Err(_) => Some(-1),
            };
            if let Some(c) = fatto {
                if let Ok(mut g) = cod.lock() {
                    *g = Some(c);
                }
                break;
            }
        });
    }
    lavori().lock().map_err(|e| e.to_string())?.insert(id, Lavoro { figlio, righe, codice });
    Ok(())
}

#[derive(Serialize)]
pub struct StatoLavoro {
    finito: bool,
    codice: i32,
    /// le righe scritte dall'ultima volta che si è guardato
    righe: Vec<String>,
}

/// Come sta andando un lavoro: se è finito (e con che codice) e le righe nuove.
#[tauri::command]
pub fn motore_lavoro(id: String) -> Esito<StatoLavoro> {
    let l = lavori().lock().map_err(|e| e.to_string())?;
    let Some(lav) = l.get(&id) else {
        return Ok(StatoLavoro { finito: true, codice: -1, righe: vec![] });
    };
    let righe = lav.righe.lock().map(|mut v| std::mem::take(&mut *v)).unwrap_or_default();
    let codice = lav.codice.lock().map(|c| *c).unwrap_or(Some(-1));
    Ok(StatoLavoro { finito: codice.is_some(), codice: codice.unwrap_or(0), righe })
}

/// Ferma un lavoro (il pulsante "Ferma") e lo dimentica.
#[tauri::command]
pub fn motore_ferma(id: String) -> Esito<()> {
    let lav = lavori().lock().map_err(|e| e.to_string())?.remove(&id);
    if let Some(l) = lav {
        if let Ok(mut g) = l.figlio.lock() {
            if let Some(ch) = g.as_mut() {
                let _ = ch.kill();
                let _ = ch.wait();
            }
            *g = None;
        }
    }
    Ok(())
}

/// Si dimentica di un lavoro finito (libera le righe).
#[tauri::command]
pub fn motore_dimentica(id: String) {
    if let Ok(mut l) = lavori().lock() {
        l.remove(&id);
    }
}

/// Le cartelle di lavoro (audio da ascoltare, risultati) stanno sotto la cartella del motore: qui si crea quella di un lavoro.
#[tauri::command]
pub async fn motore_cartella_lavoro(app: AppHandle, nome: String) -> Esito<String> {
    if nome.is_empty() || nome.contains(['/', '\\']) || nome.contains("..") {
        return Err("nome non valido".into());
    }
    let d = cartella_motori(&app)?.join("lavori").join(nome);
    let _ = std::fs::remove_dir_all(&d);
    std::fs::create_dir_all(&d).map_err(|e| e.to_string())?;
    Ok(d.to_string_lossy().into_owned())
}

/// I file di una cartella con la loro grandezza (per vedere quanti risultati sono già usciti).
#[tauri::command]
pub async fn motore_elenca(app: AppHandle, path: String) -> Esito<Vec<(String, u64)>> {
    let radice = cartella_motori(&app)?;
    let p = PathBuf::from(&path);
    if !p.starts_with(&radice) || p.components().any(|c| matches!(c, std::path::Component::ParentDir)) {
        return Err("fuori dalla cartella del motore".into());
    }
    tauri::async_runtime::spawn_blocking(move || -> Esito<Vec<(String, u64)>> {
        let mut out = Vec::new();
        if let Ok(rd) = std::fs::read_dir(&p) {
            for e in rd.flatten() {
                if let Ok(m) = e.metadata() {
                    if m.is_file() {
                        out.push((e.file_name().to_string_lossy().into_owned(), m.len()));
                    }
                }
            }
        }
        out.sort();
        Ok(out)
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Quanto pesano i modelli scaricati finora (per la barra mentre si scaricano).
#[tauri::command]
pub async fn motore_peso_modelli(app: AppHandle) -> Esito<u64> {
    let m = cartella_modelli(&app)?;
    tauri::async_runtime::spawn_blocking(move || peso_cartella(&m)).await.map_err(|e| e.to_string())
}

/// Butta via una cartella di lavoro finita.
#[tauri::command]
pub async fn motore_pulisci(app: AppHandle, path: String) -> Esito<()> {
    let radice = cartella_motori(&app)?.join("lavori");
    let p = PathBuf::from(&path);
    if !p.starts_with(&radice) || p.components().any(|c| matches!(c, std::path::Component::ParentDir)) {
        return Err("fuori dalle cartelle di lavoro".into());
    }
    let _ = std::fs::remove_dir_all(p);
    Ok(())
}

/// Toglie il motore e i suoi modelli dal computer.
#[tauri::command]
pub async fn motore_disinstalla(app: AppHandle, con_modelli: bool) -> Esito<()> {
    let dir = cartella_motori(&app)?;
    let _ = std::fs::remove_dir_all(dir.join("programma"));
    let _ = std::fs::remove_file(dir.join("installato.txt"));
    let _ = std::fs::remove_dir_all(dir.join("lavori"));
    if con_modelli {
        let _ = std::fs::remove_dir_all(dir.join("modelli"));
    }
    Ok(())
}
