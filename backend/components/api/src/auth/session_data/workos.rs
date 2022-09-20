use std::collections::HashSet;

use crate::{
    auth::{AuthError, ExtractableAuthSession},
    errors::ApiError,
};
use db::{
    models::{tenant::Tenant, tenant_role::TenantRole, tenant_user::TenantUser},
    PgConnection,
};
use newtypes::{DataAttribute, TenantPermission, TenantUserId};
use paperclip::actix::Apiv2Security;

use super::AuthSessionData;

#[derive(Debug, Clone)]
pub struct WorkOs {
    tenant: Tenant,
    tenant_role: TenantRole,
    #[allow(dead_code)]
    tenant_user: TenantUser,
    data: WorkOsSession,
}

/// Nests a private WorkOs and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested WorkOs is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested WorkOs
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Auth token for a dashboard user"
)]
pub struct ParsedWorkOs(WorkOs);

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct WorkOsSession {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub tenant_user_id: TenantUserId,
}

impl ExtractableAuthSession for ParsedWorkOs {
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
        Ok(Self(WorkOs {
            data,
            tenant,
            tenant_role,
            tenant_user,
        }))
    }
}

impl ParsedWorkOs {
    pub fn check_permissions(self, permissions: Vec<TenantPermission>) -> Result<WorkOs, AuthError> {
        if let Some(missing_permission) = permissions.into_iter().find(|p| !self.0.has_permission(p)) {
            Err(AuthError::MissingTenantPermission(missing_permission.into()))
        } else {
            Ok(self.0)
        }
    }

    pub fn can_decrypt(self, attributes: Vec<DataAttribute>) -> Result<WorkOs, AuthError> {
        if self.0.tenant_role.permissions.contains(&TenantPermission::Admin) {
            return Ok(self.0);
        }
        let can_access_attributes: HashSet<_> = self
            .0
            .tenant_role
            .permissions
            .iter()
            .filter_map(|p| match p {
                TenantPermission::Decrypt { attributes } => Some(attributes),
                _ => None,
            })
            .flatten()
            .flat_map(|x| x.attributes())
            .collect();
        if !can_access_attributes.is_superset(&HashSet::from_iter(attributes.into_iter())) {
            Err(AuthError::RoleMissingDecryptPermission)
        } else {
            Ok(self.0)
        }
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

    fn has_permission(&self, permission: &TenantPermission) -> bool {
        let role_permissions = &self.tenant_role.permissions;
        role_permissions.contains(&TenantPermission::Admin) || role_permissions.contains(permission)
    }
}
