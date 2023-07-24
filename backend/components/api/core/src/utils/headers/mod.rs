use actix_web::http::header::HeaderMap;

mod insight;
pub use insight::*;

mod telemetry;
pub use telemetry::*;

mod allow_extra_fields;
pub use allow_extra_fields::*;

mod idempotency_id;
pub use idempotency_id::*;

mod sandbox_id;
pub use sandbox_id::*;

mod ignore_luhn_validation;
pub use ignore_luhn_validation::*;

use crate::{
    errors::{ApiError, ApiResult},
    ApiErrorKind,
};

pub fn get_header(name: &str, req: &HeaderMap) -> Option<String> {
    req.get(name).and_then(|h| h.to_str().ok()).map(|s| s.to_string())
}

pub fn get_required_header(name: &'static str, req: &HeaderMap) -> ApiResult<String> {
    req.get(name)
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string())
        .ok_or(ApiErrorKind::MissingRequiredHeader(name))
        .map_err(ApiError::from)
}
