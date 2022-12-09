use crate::{
    auth::{
        session::{AuthSessionData, ExtractableAuthSession},
        AuthError, SessionContext,
    },
    errors::ApiError,
};
use db::{
    models::{tenant::Tenant, tenant_role::TenantRole, tenant_user::TenantUser},
    PgConnection,
};
use newtypes::{DataLifetimeKind, TenantPermission, TenantUserId};
use paperclip::actix::Apiv2Security;

use super::{AuthActor, CheckTenantPermissions, TenantAuth};

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
        let (tenant, tenant_role, tenant_user) = TenantUser::login_by_id(conn, &data.tenant_user_id)?;

        tracing::info!(tenant_id=%tenant.id, tenant_role_id=%tenant_role.id, tenant_user_id=%tenant_user.id, "authenticated");

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
        if let Some(missing_permission) = permissions
            .into_iter()
            .find(|p| !self.0.tenant_role.permissions.has_permission(p))
        {
            Err(AuthError::MissingTenantPermission(missing_permission.into()))
        } else {
            Ok(self.0)
        }
    }

    pub fn can_decrypt(self, attributes: Vec<DataLifetimeKind>) -> Result<WorkOs, AuthError> {
        if self.0.tenant_role.permissions.can_decrypt(attributes) {
            Ok(self.0)
        } else {
            Err(AuthError::RoleMissingDecryptPermission)
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
}

/// A shorthand for the commonly used ParsedWorkOs context
pub type WorkOsAuthContext = SessionContext<ParsedWorkOs>;

impl CheckTenantPermissions for WorkOsAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a WorkOs
    /// that is accessible
    fn check_permissions(self, permissions: Vec<TenantPermission>) -> Result<Box<dyn TenantAuth>, AuthError> {
        let result = self.map(|c| c.check_permissions(permissions))?;
        Ok(Box::new(result))
    }

    fn can_decrypt(self, attributes: Vec<DataLifetimeKind>) -> Result<Box<dyn TenantAuth>, AuthError> {
        let result = self.map(|c| c.can_decrypt(attributes))?;
        Ok(Box::new(result))
    }
}

impl TenantAuth for SessionContext<WorkOs> {
    fn is_live(&self) -> Result<bool, ApiError> {
        let is_live: Option<bool> = self
            .headers
            .0
            .get("x-is-live".to_owned())
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .and_then(|v| v.trim().parse::<bool>().ok());

        // error if the tenant is sandbox-restricted but is requesting live data
        let is_sandbox_restricted = self.data.tenant().sandbox_restricted;
        if is_sandbox_restricted && is_live == Some(true) {
            return Err(AuthError::SandboxRestricted.into());
        }

        // otherwise return the default of the sent header or live if not restricted
        Ok(is_live.unwrap_or(!is_sandbox_restricted))
    }

    fn tenant(&self) -> &Tenant {
        self.data.tenant()
    }

    fn format_principal(&self) -> String {
        self.data.format_principal()
    }

    fn actor(&self) -> AuthActor {
        AuthActor::from(self.data.tenant_user.id.clone())
    }
}
