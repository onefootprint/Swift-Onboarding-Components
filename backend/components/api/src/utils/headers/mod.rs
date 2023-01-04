use actix_web::http::header::HeaderMap;

mod insight;
pub use insight::*;

mod telemetry;
pub use telemetry::*;

use crate::errors::{ApiError, ApiResult};

pub fn get_header(name: &str, req: &HeaderMap) -> Option<String> {
    req.get(name).and_then(|h| h.to_str().ok()).map(|s| s.to_string())
}

pub fn get_required_header(name: &'static str, req: &HeaderMap) -> ApiResult<String> {
    req.get(name)
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string())
        .ok_or(ApiError::MissingRequiredHeader(name))
}
