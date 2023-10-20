use std::sync::Arc;

use super::{AuthActor, CanCheckTenantGuard, GetFirmEmployee, TenantAuth};
use crate::{
    auth::{
        session::{
            get_is_live, tenant::TenantRbSession, AllowSessionUpdate, AuthSessionData,
            ExtractableAuthSession, RequestInfo,
        },
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
use feature_flag::FeatureFlagClient;
use newtypes::{DataLifetimeSource, TenantRolebindingId, TenantScope, WorkosAuthMethod};
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
    is_live: bool,
    pub(super) auth_method: WorkosAuthMethod,
}

/// Nests a private TenantRbAuth and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested TenantRbAuth is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested TenantRbAuth
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Dashboard Token",
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Short-lived token for an authenticated dashboard user."
)]
pub struct ParsedTenantRbAuth(pub(super) TenantRbAuth);

impl TenantRbSession {
    pub fn create(
        tenant: &Tenant,
        rb_id: TenantRolebindingId,
        auth_method: WorkosAuthMethod,
    ) -> ApiResult<Self> {
        if !tenant.supports_auth_method(auth_method) {
            return Err(AuthError::UnsupportedAuthMethod.into());
        }
        Ok(Self {
            tenant_rolebinding_id: rb_id,
            auth_method,
        })
    }
}

impl ExtractableAuthSession for ParsedTenantRbAuth {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
        req: RequestInfo,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::TenantRb(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (tu, rb, tr, tenant) = TenantRolebinding::get(conn, &data.tenant_rolebinding_id)?;
        let is_live = get_is_live(&req).unwrap_or(!tenant.sandbox_restricted);

        tracing::info!(tenant_id=%tenant.id, tenant_role_id=%tr.id, tenant_rb_id=%rb.id, tenant_user_id=%tu.id, "authenticated");

        Ok(Self(TenantRbAuth {
            tenant,
            tenant_rolebinding: rb,
            tenant_role: tr,
            tenant_user: tu,
            is_live,
            auth_method: data.auth_method,
        }))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.0.tenant.id.to_string());
        root_span.record("tenant_user_id", &self.0.tenant_user.id.to_string());
        root_span.record("is_live", self.0.is_live);
    }
}

impl SessionContext<ParsedTenantRbAuth> {
    pub fn rolebinding(&self) -> Option<&TenantRolebinding> {
        Some(&self.0.tenant_rolebinding)
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
    fn token_scopes(&self) -> Vec<TenantScope> {
        self.0.tenant_role.scopes.clone()
    }

    fn tenant_auth(self) -> Box<dyn TenantAuth> {
        Box::new(self.map(|d| d.0))
    }
}

impl TenantAuth for SessionContext<TenantRbAuth> {
    fn is_live(&self) -> ApiResult<bool> {
        if self.tenant().sandbox_restricted && self.is_live {
            // error if the tenant is sandbox-restricted but is requesting live data
            return Err(AuthError::SandboxRestricted.into());
        }
        Ok(self.is_live)
    }

    fn tenant(&self) -> &Tenant {
        self.data.tenant()
    }

    fn actor(&self) -> AuthActor {
        AuthActor::from(self.tenant_user.id.clone())
    }

    fn scopes(&self) -> Vec<TenantScope> {
        self.tenant_role.scopes.clone()
    }

    fn source(&self) -> DataLifetimeSource {
        DataLifetimeSource::Tenant
    }
}

// Allow calling SessionContext<T>::update for T=ParsedTenantRbAuth, only for mutating a token to be used
// for impersonation
impl AllowSessionUpdate for ParsedTenantRbAuth {}

impl GetFirmEmployee for TenantRbAuthContext {
    fn firm_employee_user(&self) -> ApiResult<TenantUser> {
        let tu = &self.0.tenant_user;
        if !tu.is_firm_employee {
            return Err(AuthError::NotFirmEmployee.into());
        }
        Ok(tu.clone())
    }
}
