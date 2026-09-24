//! Decodifica audio di riserva, in Rust con Symphonia.
//!
//! Sul Mac l'interfaccia gira in WebKit: fino a Safari 18 WebKit non ha l'`AudioDecoder` di WebCodecs e
//! l'audio AAC o MP3 dei video resterebbe muto. In quel caso il JavaScript manda qui i pacchetti compressi
//! uno per volta e riceve indietro i campioni PCM. Su Windows e Android (Chromium) non serve e non si usa.

use std::collections::HashMap;
use std::sync::Mutex;

use symphonia::core::audio::Channels;
use symphonia::core::codecs::audio::well_known::{CODEC_ID_AAC, CODEC_ID_FLAC, CODEC_ID_MP3, CODEC_ID_VORBIS};
use symphonia::core::codecs::audio::{AudioCodecParameters, AudioDecoder, AudioDecoderOptions};
use symphonia::core::packet::Packet;
use symphonia::core::units::{Duration, Timestamp};

#[derive(Default)]
pub struct Decoder {
    aperti: Mutex<HashMap<u32, Box<dyn AudioDecoder>>>,
    prossimo: Mutex<u32>,
}

/// AudioSpecificConfig AAC-LC costruito da frequenza e canali, quando il contenitore non lo dà (ADTS, TS).
fn asc_aac(sample_rate: u32, canali: u16) -> Box<[u8]> {
    const FREQ: [u32; 13] = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
    let idx = FREQ.iter().position(|&f| f == sample_rate).unwrap_or(4) as u8;
    let ch = canali.min(7) as u8;
    // 5 bit tipo oggetto (2 = LC), 4 bit indice frequenza, 4 bit configurazione canali, 3 bit a zero
    Box::new([(2 << 3) | (idx >> 1), ((idx & 1) << 7) | (ch << 3)])
}

impl Decoder {
    pub fn apri(&self, codec: &str, sample_rate: u32, canali: u16, descrizione: Option<Vec<u8>>) -> Result<u32, String> {
        let id_codec = match codec {
            "aac" => CODEC_ID_AAC,
            "mp3" => CODEC_ID_MP3,
            "flac" => CODEC_ID_FLAC,
            "vorbis" => CODEC_ID_VORBIS,
            altro => return Err(format!("codec {altro} non gestito dalla riserva")),
        };
        let mut p = AudioCodecParameters::new();
        p.for_codec(id_codec)
            .with_sample_rate(sample_rate)
            .with_channels(Channels::Discrete(canali.max(1)));
        match descrizione {
            Some(d) if !d.is_empty() => {
                p.with_extra_data(d.into_boxed_slice());
            }
            _ if codec == "aac" => {
                p.with_extra_data(asc_aac(sample_rate, canali));
            }
            _ => {}
        }
        let dec = symphonia::default::get_codecs()
            .make_audio_decoder(&p, &AudioDecoderOptions::default())
            .map_err(|e| e.to_string())?;
        let mut n = self.prossimo.lock().map_err(|e| e.to_string())?;
        *n += 1;
        self.aperti.lock().map_err(|e| e.to_string())?.insert(*n, dec);
        Ok(*n)
    }

    /// Decodifica un pacchetto. Ritorna: fotogrammi (u32), canali (u32), frequenza (u32) e poi i campioni
    /// f32 interleaved, tutto little-endian.
    pub fn decodifica(&self, id: u32, dati: &[u8]) -> Result<Vec<u8>, String> {
        let mut aperti = self.aperti.lock().map_err(|e| e.to_string())?;
        let dec = aperti.get_mut(&id).ok_or("decoder non aperto")?;
        let pacchetto = Packet::new(0, Timestamp::new(0), Duration::new(0), dati.to_vec());
        let buf = match dec.decode(&pacchetto) {
            Ok(b) => b,
            // un pacchetto rovinato non ferma tutto: si passa al prossimo
            Err(symphonia::core::errors::Error::DecodeError(_)) => return Ok(intestazione(0, 0, 0)),
            Err(e) => return Err(e.to_string()),
        };
        let frames = buf.frames();
        let canali = buf.num_planes();
        let rate = buf.spec().rate();
        let mut campioni: Vec<f32> = Vec::with_capacity(frames * canali);
        buf.copy_to_vec_interleaved(&mut campioni);
        let mut out = intestazione(frames as u32, canali as u32, rate);
        out.reserve(campioni.len() * 4);
        for s in campioni {
            out.extend_from_slice(&s.to_le_bytes());
        }
        Ok(out)
    }

    pub fn chiudi(&self, id: u32) {
        if let Ok(mut a) = self.aperti.lock() {
            a.remove(&id);
        }
    }
}

fn intestazione(frames: u32, canali: u32, rate: u32) -> Vec<u8> {
    let mut v = Vec::with_capacity(12);
    v.extend_from_slice(&frames.to_le_bytes());
    v.extend_from_slice(&canali.to_le_bytes());
    v.extend_from_slice(&rate.to_le_bytes());
    v
}

#[cfg(test)]
mod prove {
    use super::*;

    #[test]
    fn asc_48k_stereo() {
        // AAC-LC, 48 kHz (indice 3), stereo: 0x11 0x90
        assert_eq!(&*asc_aac(48000, 2), &[0x11, 0x90]);
        // 44,1 kHz (indice 4), stereo: 0x12 0x10
        assert_eq!(&*asc_aac(44100, 2), &[0x12, 0x10]);
    }

    #[test]
    fn apre_i_decoder() {
        let d = Decoder::default();
        assert!(d.apri("aac", 48000, 2, None).is_ok());
        assert!(d.apri("mp3", 44100, 2, None).is_ok());
        assert!(d.apri("opus", 48000, 2, None).is_err());
    }

    /// Se esiste test/.tmp/aac/ (pacchetti AAC veri, fatti dalle prove nel browser) li decodifica tutti.
    #[test]
    fn decodifica_aac_vero() {
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../test/.tmp/aac");
        let Ok(desc) = std::fs::read(dir.join("descrizione.bin")) else { return };
        let d = Decoder::default();
        let id = d.apri("aac", 48000, 2, Some(desc)).unwrap();
        let mut totale = 0usize;
        let mut energia = 0f64;
        let mut i = 0;
        while let Ok(p) = std::fs::read(dir.join(format!("p{i:05}.bin"))) {
            let out = d.decodifica(id, &p).unwrap();
            let frames = u32::from_le_bytes(out[0..4].try_into().unwrap()) as usize;
            totale += frames;
            for c in out[12..].chunks_exact(4) {
                let s = f32::from_le_bytes(c.try_into().unwrap()) as f64;
                energia += s * s;
            }
            i += 1;
        }
        assert!(i > 10, "pochi pacchetti");
        assert!(totale > 1024 * (i - 2), "fotogrammi decodificati: {totale}");
        assert!(energia > 1.0, "silenzio: l'audio non si è decodificato");
    }
}
