//! DaProd Video — il lato Rust dell'app.
//!
//! L'interfaccia (il banco di montaggio) è web e gira nella WebView del sistema; qui c'è quello che il
//! browser da solo non sa fare bene: leggere i file video a pezzi dal disco (anche da ore di girato,
//! senza caricarli in memoria), scrivere l'export mentre esce, salvare i progetti e l'autosalvataggio.
//! Su Android i file arrivano come `content://` e passano dal plugin fs, che li apre con un descrittore vero.

mod audio_riserva;

use std::collections::HashMap;
use std::io::{Read, Seek, SeekFrom, Write};
use std::str::FromStr;
use std::sync::{Arc, Mutex};

use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_fs::{FilePath, FsExt, OpenOptions};

/// File aperti: i media in lettura (restano aperti, si legge a salti) e gli export in scrittura.
#[derive(Default)]
struct Stato {
    letture: Mutex<HashMap<String, Arc<Mutex<std::fs::File>>>>,
    scritture: Mutex<HashMap<u32, Arc<Mutex<std::fs::File>>>>,
    prossimo: Mutex<u32>,
}

type Esito<T> = Result<T, String>;

fn percorso(p: &str) -> FilePath {
    FilePath::from_str(p).unwrap_or_else(|_| FilePath::Path(p.into()))
}

fn apri_lettura(app: &AppHandle, stato: &Stato, path: &str) -> Esito<Arc<Mutex<std::fs::File>>> {
    let mut l = stato.letture.lock().map_err(|e| e.to_string())?;
    if let Some(f) = l.get(path) {
        return Ok(f.clone());
    }
    // non più di 64 file aperti insieme: si chiude il più vecchio a caso
    if l.len() >= 64 {
        if let Some(k) = l.keys().next().cloned() {
            l.remove(&k);
        }
    }
    let mut o = OpenOptions::new();
    o.read(true);
    let f = app
        .fs()
        .open(percorso(path), o)
        .map_err(|e| format!("non riesco ad aprire {path}: {e}"))?;
    let f = Arc::new(Mutex::new(f));
    l.insert(path.to_string(), f.clone());
    Ok(f)
}

/// Dimensione di un file media in byte.
#[tauri::command]
async fn media_dimensione(app: AppHandle, stato: State<'_, Stato>, path: String) -> Esito<u64> {
    let f = apri_lettura(&app, &stato, &path)?;
    tauri::async_runtime::spawn_blocking(move || {
        let mut f = f.lock().map_err(|e| e.to_string())?;
        // la dimensione si misura andando in fondo: funziona anche con i descrittori di Android
        f.seek(SeekFrom::End(0)).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Legge i byte [start, end) di un file media. Arriva al JavaScript come ArrayBuffer, senza JSON.
#[tauri::command]
async fn media_leggi(app: AppHandle, stato: State<'_, Stato>, path: String, start: u64, end: u64) -> Esito<Response> {
    let f = apri_lettura(&app, &stato, &path)?;
    let dati = tauri::async_runtime::spawn_blocking(move || -> Esito<Vec<u8>> {
        let n = end.saturating_sub(start) as usize;
        let mut buf = vec![0u8; n];
        let mut f = f.lock().map_err(|e| e.to_string())?;
        f.seek(SeekFrom::Start(start)).map_err(|e| e.to_string())?;
        let mut letti = 0;
        while letti < n {
            let k = f.read(&mut buf[letti..]).map_err(|e| e.to_string())?;
            if k == 0 {
                break;
            }
            letti += k;
        }
        buf.truncate(letti);
        Ok(buf)
    })
    .await
    .map_err(|e| e.to_string())??;
    Ok(Response::new(dati))
}

/// Chiude un media (quando si toglie dal contenitore).
#[tauri::command]
fn media_chiudi(stato: State<'_, Stato>, path: String) {
    if let Ok(mut l) = stato.letture.lock() {
        l.remove(&path);
    }
}

/// Legge un progetto (.dpv) o un altro file di testo.
#[tauri::command]
async fn progetto_leggi(app: AppHandle, path: String) -> Esito<String> {
    app.fs()
        .read_to_string(percorso(&path))
        .map_err(|e| format!("non riesco a leggere {path}: {e}"))
}

/// Scrive un progetto, una EDL o un altro file di testo.
#[tauri::command]
async fn progetto_scrivi(app: AppHandle, path: String, text: String) -> Esito<()> {
    let mut o = OpenOptions::new();
    o.write(true).create(true).truncate(true);
    let mut f = app
        .fs()
        .open(percorso(&path), o)
        .map_err(|e| format!("non riesco a scrivere {path}: {e}"))?;
    f.write_all(text.as_bytes()).map_err(|e| e.to_string())?;
    f.flush().map_err(|e| e.to_string())
}

fn file_autosalvataggio(app: &AppHandle) -> Esito<std::path::PathBuf> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("autosalvataggio.dpv"))
}

/// Autosalvataggio: si scrive accanto e poi si rinomina, così un'interruzione non lascia un file mozzo.
#[tauri::command]
async fn autosalva(app: AppHandle, text: String) -> Esito<()> {
    let f = file_autosalvataggio(&app)?;
    let tmp = f.with_extension("tmp");
    std::fs::write(&tmp, text.as_bytes()).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp, &f).map_err(|e| e.to_string())
}

#[tauri::command]
async fn autosalvataggio_leggi(app: AppHandle) -> Esito<String> {
    let f = file_autosalvataggio(&app)?;
    Ok(std::fs::read_to_string(f).unwrap_or_default())
}

/// Dove si salva un'istantanea (il fotogramma fotografato dal monitor): nella cartella dati dell'app,
/// così il progetto la ritrova anche dopo. Il nome non si ripete mai.
#[tauri::command]
async fn istantanea_percorso(app: AppHandle, name: String) -> Esito<String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("istantanee");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let pulito: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || " ._-".contains(c) { c } else { '_' })
        .collect();
    let base = pulito.trim_end_matches(".png").to_string();
    let mut p = dir.join(format!("{base}.png"));
    let mut n = 2;
    while p.exists() {
        p = dir.join(format!("{base} ({n}).png"));
        n += 1;
    }
    Ok(p.to_string_lossy().into_owned())
}

/// Apre il file dell'export in scrittura; ritorna un numero da usare per scrivere e chiudere.
#[tauri::command]
async fn export_apri(app: AppHandle, stato: State<'_, Stato>, path: String) -> Esito<u32> {
    let mut o = OpenOptions::new();
    o.read(true).write(true).create(true).truncate(true);
    let f = app
        .fs()
        .open(percorso(&path), o)
        .map_err(|e| format!("non riesco a creare {path}: {e}"))?;
    let mut n = stato.prossimo.lock().map_err(|e| e.to_string())?;
    *n += 1;
    let id = *n;
    stato
        .scritture
        .lock()
        .map_err(|e| e.to_string())?
        .insert(id, Arc::new(Mutex::new(f)));
    Ok(id)
}

/// Scrive un pezzo dell'export. Il corpo della richiesta sono i byte grezzi; posizione e file
/// arrivano nelle intestazioni (x-pos, x-id). L'MP4 torna indietro a sistemare le intestazioni: si salta.
#[tauri::command]
async fn export_scrivi(stato: State<'_, Stato>, request: Request<'_>) -> Esito<()> {
    let id: u32 = request
        .headers()
        .get("x-id")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse().ok())
        .ok_or("manca x-id")?;
    let pos: u64 = request
        .headers()
        .get("x-pos")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse().ok())
        .ok_or("manca x-pos")?;
    let InvokeBody::Raw(dati) = request.body() else {
        return Err("servono byte grezzi".into());
    };
    let f = stato
        .scritture
        .lock()
        .map_err(|e| e.to_string())?
        .get(&id)
        .cloned()
        .ok_or("export non aperto")?;
    let dati = dati.clone();
    tauri::async_runtime::spawn_blocking(move || -> Esito<()> {
        let mut f = f.lock().map_err(|e| e.to_string())?;
        f.seek(SeekFrom::Start(pos)).map_err(|e| e.to_string())?;
        f.write_all(&dati).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn export_chiudi(stato: State<'_, Stato>, id: u32) -> Esito<()> {
    let f = stato.scritture.lock().map_err(|e| e.to_string())?.remove(&id);
    if let Some(f) = f {
        let mut f = f.lock().map_err(|e| e.to_string())?;
        f.flush().map_err(|e| e.to_string())?;
        f.sync_all().ok();
    }
    Ok(())
}

/// Decodifica audio di riserva (vedi audio_riserva.rs): apre un decoder per una traccia.
#[tauri::command]
fn audio_apri(dec: State<'_, audio_riserva::Decoder>, codec: String, sample_rate: u32, channels: u16, description: Option<Vec<u8>>) -> Esito<u32> {
    dec.apri(&codec, sample_rate, channels, description)
}

/// Decodifica un pacchetto: il corpo sono i byte compressi, x-id il decoder. Torna PCM f32.
#[tauri::command]
async fn audio_decodifica(dec: State<'_, audio_riserva::Decoder>, request: Request<'_>) -> Esito<Response> {
    let id: u32 = request
        .headers()
        .get("x-id")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse().ok())
        .ok_or("manca x-id")?;
    let InvokeBody::Raw(dati) = request.body() else {
        return Err("servono byte grezzi".into());
    };
    Ok(Response::new(dec.decodifica(id, dati)?))
}

#[tauri::command]
fn audio_chiudi(dec: State<'_, audio_riserva::Decoder>, id: u32) {
    dec.chiudi(id);
}

/// Apre un link nel browser di sistema.
#[tauri::command]
fn apri_link(app: AppHandle, url: String) -> Esito<()> {
    use tauri_plugin_opener::OpenerExt;
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("solo link web".into());
    }
    app.opener().open_url(url, None::<&str>).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Stato::default())
        .manage(audio_riserva::Decoder::default())
        .invoke_handler(tauri::generate_handler![
            media_dimensione,
            media_leggi,
            media_chiudi,
            progetto_leggi,
            progetto_scrivi,
            autosalva,
            autosalvataggio_leggi,
            export_apri,
            export_scrivi,
            export_chiudi,
            apri_link,
            istantanea_percorso,
            audio_apri,
            audio_decodifica,
            audio_chiudi,
        ])
        .run(tauri::generate_context!())
        .expect("errore all'avvio di DaProd Video");
}
