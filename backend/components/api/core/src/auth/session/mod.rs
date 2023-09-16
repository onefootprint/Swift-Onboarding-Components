mod context;
use std::sync::Arc;

pub use context::*;
mod data;
pub use data::*;
mod update;
use tracing_actix_web::RootSpan;
pub use update::*;

use db::PgConn;

use crate::errors::ApiError;
use feature_flag::FeatureFlagClient;
use paperclip::v2::schema::Apiv2Schema;

pub mod check;

/// Allows an auth session to be extracted from an actix request using the extractor SessionContext utility
pub trait ExtractableAuthSession: Apiv2Schema + Sized + Send + Sync + 'static {
    fn header_names() -> Vec<&'static str>;

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        ff_client: Arc<dyn FeatureFlagClient>,
    ) -> Result<Self, ApiError>;

    fn log_authed_principal(&self, root_span: RootSpan);
}
