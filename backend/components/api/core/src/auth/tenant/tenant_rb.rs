use super::{AuthActor, CanCheckTenantGuard, GetFirmEmployee, TenantAuth};
use crate::{
    auth::{
        session::{AllowSessionUpdate, AuthSessionData, ExtractableAuthSession},
        AuthError, SessionContext,
    },
    errors::ApiResult,
};
use db::{
    models::{
        tenant::Tenant, tenant_role::TenantRole, tenant_rolebinding::TenantRolebinding,
        tenant_user::TenantUser,
    },
    PgConn,
};
use feature_flag::LaunchDarklyFeatureFlagClient;
use newtypes::{TenantRolebindingId, TenantScope};
use paperclip::actix::Apiv2Security;

#[derive(Debug, Clone)]
/// Represents all tenant info identified by a tenant RB session token. This struct is hydrated from
/// the DB using the information on the TenantRbSession
pub struct TenantRbAuth {
    tenant: Tenant,
    tenant_role: TenantRole,
    tenant_user: TenantUser,
    #[allow(unused)]
    tenant_rolebinding: TenantRolebinding,
    #[allow(unused)]
    data: TenantRbSession,
}

/// Nests a private TenantRbAuth and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested TenantRbAuth is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested TenantRbAuth
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Auth token for a dashboard user"
)]
pub struct ParsedTenantRbAuth(TenantRbAuth);

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
/// The struct that is serialized and saved into the session table in the DB.
/// The session token is used to look up this session info, and this session info is used to fetch
/// the related user, rolebinding, role, and tenant information from the DB
pub struct TenantRbSession {
    pub tenant_rolebinding_id: TenantRolebindingId,
}

impl From<TenantRolebinding> for TenantRbSession {
    fn from(rb: TenantRolebinding) -> Self {
        Self {
            tenant_rolebinding_id: rb.id,
        }
    }
}

impl ExtractableAuthSession for ParsedTenantRbAuth {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_from(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        _: LaunchDarklyFeatureFlagClient,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::TenantRb(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (tu, rb, tr, tenant) = TenantRolebinding::get(conn, &data.tenant_rolebinding_id)?;

        tracing::info!(tenant_id=%tenant.id, tenant_role_id=%tr.id, tenant_rb_id=%rb.id, tenant_user_id=%tu.id, "authenticated");

        Ok(Self(TenantRbAuth {
            data,
            tenant,
            tenant_rolebinding: rb,
            tenant_role: tr,
            tenant_user: tu,
        }))
    }
}

impl TenantRbAuth {
    pub fn tenant(&self) -> &Tenant {
        &self.tenant
    }
}

/// A shorthand for the commonly used ParsedTenantRbAuth context
pub type TenantRbAuthContext = SessionContext<ParsedTenantRbAuth>;

impl CanCheckTenantGuard for TenantRbAuthContext {
    fn role(&self) -> &TenantRole {
        &self.data.0.tenant_role
    }

    fn token_scopes(&self) -> Vec<TenantScope> {
        CanCheckTenantGuard::role(self).scopes.clone()
    }

    fn tenant_auth(self) -> Box<dyn TenantAuth> {
        Box::new(self.map(|d| d.0))
    }
}

impl TenantAuth for SessionContext<TenantRbAuth> {
    fn is_live(&self) -> ApiResult<bool> {
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

    fn rolebinding(&self) -> Option<&TenantRolebinding> {
        Some(&self.data.tenant_rolebinding)
    }

    fn actor(&self) -> AuthActor {
        AuthActor::from(self.data.tenant_user.id.clone())
    }
}

impl GetFirmEmployee for TenantRbAuthContext {
    fn firm_employee_user(&self) -> ApiResult<TenantUser> {
        let tenant_user = self.data.0.tenant_user.clone();
        if !tenant_user.is_firm_employee {
            // TODO should we hide these errors with 404s?
            return Err(AuthError::NotFirmEmployee.into());
        }
        Ok(tenant_user)
    }
}

// Allow calling SessionContext<T>::update for T=ParsedTenantRbAuth, only for mutating a token to be used
// for impersonation
impl AllowSessionUpdate for ParsedTenantRbAuth {}
