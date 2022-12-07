use actix_web::http::header::HeaderMap;

mod insight;
pub use insight::*;

mod telemetry;
pub use telemetry::*;

fn get_header(name: &str, req: &HeaderMap) -> Option<String> {
    req.get(name).and_then(|h| h.to_str().ok()).map(|s| s.to_string())
}
