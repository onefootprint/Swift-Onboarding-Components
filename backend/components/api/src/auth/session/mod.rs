mod context;
pub use context::*;
mod data;
pub use data::*;

use db::PgConn;

use crate::errors::ApiError;
use feature_flag::LaunchDarklyFeatureFlagClient;

/// Allows an auth session to be extracted from an actix request using the extractor SessionContext utility
pub trait ExtractableAuthSession: Sized + Send + Sync + 'static {
    fn header_names() -> Vec<&'static str>;

    fn try_from(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        ff_client: LaunchDarklyFeatureFlagClient,
    ) -> Result<Self, ApiError>;
}
