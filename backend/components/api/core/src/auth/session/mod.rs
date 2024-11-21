mod context;
pub use context::*;
use crypto::aead::ScopedSealingKey;
use std::sync::Arc;
mod data;
pub use data::*;
mod update;

use crate::FpResult;
use actix_web::http::header::HeaderMap;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use http::Method;
use paperclip::v2::schema::Apiv2Schema;
use tracing_actix_web::RootSpan;
pub use update::*;

pub mod check;

pub struct LoadSessionContext {
    pub ff_client: Arc<dyn FeatureFlagClient>,
    pub sealing_key: ScopedSealingKey,
    pub req: RequestInfo,
}

pub struct RequestInfo {
    pub headers: HeaderMap,
    pub method: Method,
}

impl<'a> From<&'a actix_web::HttpRequest> for RequestInfo {
    fn from(value: &'a actix_web::HttpRequest) -> Self {
        Self {
            headers: value.headers().clone(),
            method: value.method().clone(),
        }
    }
}

impl std::fmt::Debug for RequestInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("RequestInfo {<redacted>}")
    }
}

/// Allows an auth session to be extracted from an actix request using the extractor SessionContext
/// utility
pub trait ExtractableAuthSession: Apiv2Schema + Sized + Send + Sync + 'static {
    fn header_names() -> Vec<&'static str>;

    fn header_names_for_err() -> Vec<&'static str> {
        Self::header_names()
    }

    fn try_load_session(
        conn: &mut PgConn,
        auth_session: AuthSessionData,
        ctx: LoadSessionContext,
    ) -> FpResult<Self>;

    fn log_authed_principal(&self, root_span: RootSpan);
}

pub fn get_is_live(req: &RequestInfo) -> Option<bool> {
    req.headers
        .get("x-is-live".to_owned())
        .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
        .and_then(|v| v.trim().parse::<bool>().ok())
}
