use db::PgConn;
use newtypes::TenantUserId;
use paperclip::actix::Apiv2Schema;

use crate::{
    auth::{
        session::{AllowSessionUpdate, AuthSessionData, ExtractableAuthSession},
        AuthError,
    },
    errors::ApiResult,
};
use feature_flag::LaunchDarklyFeatureFlagClient;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct WorkOsSession {
    /// The TenantUserId that is proven to be owned via a workos auth
    pub tenant_user_id: TenantUserId,
}

impl ExtractableAuthSession for WorkOsSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_from(
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
