use crate::{
    auth::{AuthError, ExtractableAuthSession},
    errors::ApiError,
};
use db::{
    models::{tenant::Tenant, tenant_role::TenantRole, tenant_user::TenantUser},
    PgConnection,
};
use newtypes::TenantUserId;
use paperclip::actix::Apiv2Security;

use super::AuthSessionData;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Auth token for a dashboard user"
)]
pub struct WorkOs {
    tenant: Tenant,
    tenant_role: TenantRole,
    tenant_user: TenantUser,
    data: WorkOsSession,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct WorkOsSession {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub tenant_user_id: TenantUserId,
}

impl ExtractableAuthSession for WorkOs {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_from(auth_session: AuthSessionData, conn: &mut PgConnection) -> Result<Self, ApiError> {
        let data = match auth_session {
            AuthSessionData::WorkOs(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (tenant, tenant_role, tenant_user) = Tenant::get_by_user(conn, &data.tenant_user_id)?;
        Ok(Self {
            data,
            tenant,
            tenant_role,
            tenant_user,
        })
    }
}

impl WorkOs {
    pub fn tenant(&self) -> &Tenant {
        &self.tenant
    }

    pub fn format_principal(&self) -> String {
        // Show "Name (email)" as the principal if the name is set, otherwise just email
        let name = match (&self.data.first_name, &self.data.last_name) {
            (Some(first_name), Some(last_name)) => Some(format!("{} {}", first_name, last_name)),
            (Some(name), None) | (None, Some(name)) => Some(name.clone()),
            (None, None) => None,
        };
        match name {
            Some(name) => format!("{} ({})", name, self.data.email),
            None => self.data.email.clone(),
        }
    }
}
