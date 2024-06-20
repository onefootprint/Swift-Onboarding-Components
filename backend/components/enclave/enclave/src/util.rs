use std::time::SystemTime;
use std::time::UNIX_EPOCH;

pub fn now_millis() -> u128 {
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(UNIX_EPOCH).unwrap();
    since_the_epoch.as_millis()
}

pub fn log_info_t(m: &'static str) {
    log::info!("[{}] {}", now_millis(), m);
}
