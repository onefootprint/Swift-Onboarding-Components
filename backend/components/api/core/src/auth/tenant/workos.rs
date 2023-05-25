use std::sync::Arc;

use crate::{
    auth::{
        session::{tenant::WorkOsSession, AllowSessionUpdate, AuthSessionData, ExtractableAuthSession},
        AuthError,
    },
    errors::ApiResult,
};
use db::PgConn;
use feature_flag::FeatureFlagClient;
use newtypes::TenantUserId;
use paperclip::actix::Apiv2Security;

/// Represents a session where a user has logged in but is part of multiple tenants and hasn't yet
/// selected the tenant whose dashboard they want to view
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "WorkOS Token",
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Short-lived auth token for a dashboard user before selecting an individual tenant"
)]
pub struct WorkOsSessionData {
    pub tenant_user_id: TenantUserId,
}

impl ExtractableAuthSession for WorkOsSessionData {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        _: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::WorkOs(data) => {
                let WorkOsSession { tenant_user_id } = data;
                Self { tenant_user_id }
            }
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        Ok(data)
    }
}

impl AllowSessionUpdate for WorkOsSessionData {}
