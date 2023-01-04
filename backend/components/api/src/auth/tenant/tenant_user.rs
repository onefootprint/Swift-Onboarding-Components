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
use newtypes::{TenantPermission, TenantUserId};
use paperclip::actix::Apiv2Security;

use super::{AuthActor, CanCheckTenantPermissions, TenantAuth};

#[derive(Debug, Clone)]
pub struct TenantUserAuth {
    tenant: Tenant,
    tenant_role: TenantRole,
    #[allow(dead_code)]
    tenant_user: TenantUser,
    data: TenantUserSession,
}

/// Nests a private TenantUserAuth and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested TenantUserAuth is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested TenantUserAuth
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Auth token for a dashboard user"
)]
pub struct ParsedTenantUserAuth(TenantUserAuth);

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct TenantUserSession {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub tenant_user_id: TenantUserId,
}

impl From<TenantUser> for TenantUserSession {
    fn from(tu: TenantUser) -> Self {
        Self {
            email: tu.email.0,
            first_name: tu.first_name,
            last_name: tu.last_name,
            tenant_user_id: tu.id,
        }
    }
}

impl ExtractableAuthSession for ParsedTenantUserAuth {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_from(auth_session: AuthSessionData, conn: &mut PgConnection) -> Result<Self, ApiError> {
        let data = match auth_session {
            AuthSessionData::TenantUser(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (tenant_user, tenant_role, tenant) = TenantUser::get(conn, &data.tenant_user_id)?;

        tracing::info!(tenant_id=%tenant.id, tenant_role_id=%tenant_role.id, tenant_user_id=%tenant_user.id, "authenticated");

        Ok(Self(TenantUserAuth {
            data,
            tenant,
            tenant_role,
            tenant_user,
        }))
    }
}

impl TenantUserAuth {
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
pub type TenantUserAuthContext = SessionContext<ParsedTenantUserAuth>;

impl CanCheckTenantPermissions for TenantUserAuthContext {
    fn token_scopes(&self) -> &[TenantPermission] {
        &self.data.0.tenant_role.permissions
    }

    fn tenant_auth(self) -> Box<dyn TenantAuth> {
        Box::new(self.map(|d| d.0))
    }
}

impl TenantAuth for SessionContext<TenantUserAuth> {
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
