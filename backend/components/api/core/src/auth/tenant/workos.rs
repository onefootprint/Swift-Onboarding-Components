use crate::{
    auth::{
        session::{tenant::WorkOsSession, AllowSessionUpdate, AuthSessionData, ExtractableAuthSession},
        AuthError,
    },
    errors::ApiResult,
};
use db::PgConn;
use feature_flag::LaunchDarklyFeatureFlagClient;

// This is the only weird session where the extractor actually uses the same struct that is serialized
// in the DB
impl ExtractableAuthSession for WorkOsSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        _: &mut PgConn,
        _: LaunchDarklyFeatureFlagClient,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::WorkOs(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        Ok(data)
    }
}

impl AllowSessionUpdate for WorkOsSession {}
