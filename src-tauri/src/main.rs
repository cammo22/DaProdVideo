// Niente finestra di console su Windows nella versione di rilascio.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    daprod_video_lib::run()
}
