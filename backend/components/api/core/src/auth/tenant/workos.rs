use crate::auth::session::tenant::WorkOsSession;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::errors::ApiResult;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use newtypes::TenantUserId;
use newtypes::WorkosAuthMethod;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

/// Represents a session where a user has logged in but is part of multiple tenants and hasn't yet
/// selected the tenant whose dashboard they want to view
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "WorkOS Token",
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Short-lived auth token for a dashboard user before selecting an individual tenant."
)]
pub struct WorkOsSessionData {
    pub tenant_user_id: TenantUserId,
    pub auth_method: WorkosAuthMethod,
}

impl ExtractableAuthSession for WorkOsSessionData {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        _: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
        _: RequestInfo,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::WorkOs(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        tracing::info!(tenant_user_id=%data.tenant_user_id, "authenticated");
        let WorkOsSession {
            tenant_user_id,
            auth_method,
        } = data;
        let data = Self {
            tenant_user_id,
            auth_method,
        };
        Ok(data)
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("auth_method", "workos");
    }
}
