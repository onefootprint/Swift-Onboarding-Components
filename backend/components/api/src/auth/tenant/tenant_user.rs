use crate::{
    auth::{
        session::{AuthSessionData, ExtractableAuthSession},
        AuthError, SessionContext,
    },
    errors::ApiError,
};
use db::{
    models::{
        tenant::Tenant, tenant_role::TenantRole, tenant_rolebinding::TenantRolebinding,
        tenant_user::TenantUser,
    },
    PgConnection,
};
use newtypes::{TenantRolebindingId, TenantScope};
use paperclip::actix::Apiv2Security;

use super::{AuthActor, CanCheckTenantGuard, TenantAuth};

#[derive(Debug, Clone)]
/// Represents all tenant info identified by a workos session token. This struct is hydrated from
/// the DB using the information on the TenantUserSession
pub struct TenantUserAuth {
    tenant: Tenant,
    tenant_role: TenantRole,
    #[allow(unused)]
    tenant_rolebinding: TenantRolebinding,
    tenant_user: TenantUser,
    #[allow(unused)]
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
/// The struct that is serialized and saved into the session table in the DB.
/// The session token is used to look up this session info, and this session info is used to fetch
/// the related user, rolebinding, role, and tenant information from the DB
pub struct TenantUserSession {
    pub tenant_rolebinding_id: TenantRolebindingId,
}

impl From<TenantRolebinding> for TenantUserSession {
    fn from(rb: TenantRolebinding) -> Self {
        Self {
            tenant_rolebinding_id: rb.id,
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
        let (tu, rb, tr, tenant) = TenantRolebinding::get(conn, &data.tenant_rolebinding_id)?;

        tracing::info!(tenant_id=%tenant.id, tenant_role_id=%tr.id, tenant_rb_id=%rb.id, tenant_user_id=%tu.id, "authenticated");

        Ok(Self(TenantUserAuth {
            data,
            tenant,
            tenant_rolebinding: rb,
            tenant_role: tr,
            tenant_user: tu,
        }))
    }
}

impl TenantUserAuth {
    pub fn tenant(&self) -> &Tenant {
        &self.tenant
    }
}

/// A shorthand for the commonly used ParsedWorkOs context
pub type TenantUserAuthContext = SessionContext<ParsedTenantUserAuth>;

impl CanCheckTenantGuard for TenantUserAuthContext {
    fn token_scopes(&self) -> &[TenantScope] {
        &self.data.0.tenant_role.scopes
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

    fn actor(&self) -> AuthActor {
        AuthActor::from(self.data.tenant_user.id.clone())
    }
}
