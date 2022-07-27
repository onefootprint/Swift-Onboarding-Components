use crate::{
    auth::{
        session_context::HasTenant,
        session_data::{HeaderName, SessionData},
        uv_permission::{HasVaultPermission, VaultPermission},
        AuthError, SupportsIsLiveHeader,
    },
    errors::ApiError,
};
use async_trait::async_trait;
use db::{models::tenants::Tenant, DbPool};
use newtypes::TenantId;
use paperclip::actix::Apiv2Schema;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct WorkOsSession {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub tenant_id: TenantId,
    pub sandbox_restricted: bool,
}

impl TryFrom<SessionData> for WorkOsSession {
    type Error = ApiError;

    fn try_from(value: SessionData) -> Result<Self, Self::Error> {
        match value {
            SessionData::WorkOs(data) => Ok(data),
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }
}

impl HeaderName for WorkOsSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }
}

impl HasVaultPermission for WorkOsSession {
    fn has_permission(&self, permission: VaultPermission) -> bool {
        matches!(permission, VaultPermission::Decrypt(_))
    }
}

#[async_trait]
impl HasTenant for WorkOsSession {
    fn tenant_id(&self) -> TenantId {
        self.tenant_id.clone()
    }

    fn is_sandbox_restricted(&self) -> bool {
        self.sandbox_restricted
    }

    async fn tenant(&self, pool: &DbPool) -> Result<Tenant, ApiError> {
        Ok(db::tenant::get_tenant(pool, self.tenant_id.clone()).await?)
    }
}

impl WorkOsSession {
    pub fn format_principal(&self) -> String {
        // Show "Name (email)" as the principal if the name is set, otherwise just email
        let name = match (&self.first_name, &self.last_name) {
            (Some(first_name), Some(last_name)) => Some(format!("{} {}", first_name, last_name)),
            (Some(name), None) | (None, Some(name)) => Some(name.clone()),
            (None, None) => None,
        };
        match name {
            Some(name) => format!("{} ({})", name, self.email),
            None => self.email.clone(),
        }
    }
}

impl SupportsIsLiveHeader for WorkOsSession {}
