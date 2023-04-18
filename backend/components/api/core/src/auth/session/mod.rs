mod context;
pub use context::*;
mod data;
pub use data::*;
mod update;
pub use update::*;

use db::PgConn;

use crate::errors::ApiError;
use feature_flag::LaunchDarklyFeatureFlagClient;

/// Allows an auth session to be extracted from an actix request using the extractor SessionContext utility
pub trait ExtractableAuthSession: Sized + Send + Sync + 'static {
    fn header_names() -> Vec<&'static str>;

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        ff_client: LaunchDarklyFeatureFlagClient,
    ) -> Result<Self, ApiError>;
}
