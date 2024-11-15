use actix_web::http::header::HeaderMap;

mod insight;
pub use insight::*;

mod telemetry;
pub use telemetry::*;

mod idempotency_id;
pub use idempotency_id::*;

mod sandbox_id;
pub use sandbox_id::*;

mod ignore_luhn_validation;
pub use ignore_luhn_validation::*;

mod external_id;
pub use external_id::*;

mod is_components_sdk;
pub use is_components_sdk::*;

mod vault_version;
pub use vault_version::*;

mod dry_run;
pub use dry_run::*;

mod bootstrap_fields;
use crate::ApiCoreError;
use crate::FpResult;
use api_errors::FpError;
pub use bootstrap_fields::*;

pub fn get_header(name: &str, req: &HeaderMap) -> Option<String> {
    req.get(name).and_then(|h| h.to_str().ok()).map(|s| s.to_string())
}

pub fn get_bool_header(name: &str, req: &HeaderMap) -> Option<bool> {
    req.get(name)
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string())
        .map(|h| h == "true")
}

pub fn get_required_header(name: &'static str, req: &HeaderMap) -> FpResult<String> {
    let h = req
        .get(name)
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string())
        .ok_or(ApiCoreError::MissingRequiredHeader(name))
        .map_err(FpError::from)?;
    Ok(h)
}
