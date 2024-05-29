mod context;
pub use context::*;
use std::sync::Arc;
mod data;
pub use data::*;
mod update;
use crate::errors::ApiError;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use paperclip::v2::schema::Apiv2Schema;
use tracing_actix_web::RootSpan;
pub use update::*;

pub mod check;

/// Allows an auth session to be extracted from an actix request using the extractor SessionContext
/// utility
pub trait ExtractableAuthSession: Apiv2Schema + Sized + Send + Sync + 'static {
    fn header_names() -> Vec<&'static str>;

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        ff_client: Arc<dyn FeatureFlagClient>,
        req: RequestInfo,
    ) -> Result<Self, ApiError>;

    fn log_authed_principal(&self, root_span: RootSpan);
}

pub fn get_is_live(req: &RequestInfo) -> Option<bool> {
    req.headers
        .get("x-is-live".to_owned())
        .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
        .and_then(|v| v.trim().parse::<bool>().ok())
}
