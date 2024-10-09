use super::AuthActor;
use super::BasicTenantAuth;
use super::CanCheckTenantGuard;
use super::GetFirmEmployee;
use super::TenantAuth;
use crate::auth::session::get_is_live;
use crate::auth::session::tenant::TenantRbSession;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::FpResult;
use db::helpers::TenantOrPartnerTenant;
use db::models::tenant::Tenant;
use db::models::tenant_role::TenantRole;
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_user::TenantUser;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use newtypes::TenantScope;
use newtypes::TenantSessionPurpose;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

#[derive(Debug, Clone)]
/// Represents all tenant info identified by a tenant RB session token. This struct is hydrated from
/// the DB using the information on the TenantRbSession
pub struct TenantRbAuth {
    tenant: Tenant,
    tenant_role: TenantRole,
    tenant_user: TenantUser,
    tenant_rolebinding: TenantRolebinding,
    is_live: bool,
    pub(super) data: TenantRbSession,
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
pub struct ParsedTenantRbAuth<const IS_SECONDARY: bool>(pub(super) TenantRbAuth);

impl<const IS_SECONDARY: bool> ExtractableAuthSession for ParsedTenantRbAuth<IS_SECONDARY> {
    fn header_names() -> Vec<&'static str> {
        if IS_SECONDARY {
            vec!["X-Fp-Dashboard-Authorization-Secondary"]
        } else {
            vec!["X-Fp-Dashboard-Authorization"]
        }
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
        req: RequestInfo,
    ) -> FpResult<Self> {
        let data = match auth_session {
            AuthSessionData::TenantRb(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (tu, rb, tr, t_pt) = TenantRolebinding::get(conn, &data.tenant_rolebinding_id)?;
        let tenant = match t_pt {
            TenantOrPartnerTenant::Tenant(tenant) => tenant,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };

        let is_live = get_is_live(&req).unwrap_or(!tenant.sandbox_restricted);

        tracing::info!(tenant_id=%tenant.id, tenant_role_id=%tr.id, tenant_rb_id=%rb.id, tenant_user_id=%tu.id, "authenticated");

        Ok(Self(TenantRbAuth {
            tenant,
            tenant_rolebinding: rb,
            tenant_role: tr,
            tenant_user: tu,
            is_live,
            data,
        }))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.0.tenant.id.to_string());
        root_span.record("is_live", self.0.is_live);
        root_span.record("auth_method", "tenant_rb");
    }
}

impl<const IS_SECONDARY: bool> SessionContext<ParsedTenantRbAuth<IS_SECONDARY>> {
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
pub type TenantRbAuthContext<const IS_SECONDARY: bool = false> =
    SessionContext<ParsedTenantRbAuth<IS_SECONDARY>>;

impl<const IS_SECONDARY: bool> CanCheckTenantGuard for TenantRbAuthContext<IS_SECONDARY> {
    type Auth = Box<dyn TenantAuth>;

    fn raw_token_scopes(&self) -> Vec<TenantScope> {
        self.0.tenant_role.scopes.clone()
    }

    fn auth(self) -> Box<dyn TenantAuth> {
        Box::new(self.map(|d| d.0))
    }

    fn purpose(&self) -> Option<TenantSessionPurpose> {
        Some(self.data.0.data.purpose)
    }
}

impl BasicTenantAuth for SessionContext<TenantRbAuth> {
    fn is_live(&self) -> FpResult<bool> {
        if self.tenant().sandbox_restricted && self.is_live {
            // Error if the tenant is sandbox-restricted but is requesting live data
            return Err(AuthError::SandboxRestricted.into());
        }
        if self.data.data.purpose == TenantSessionPurpose::Docs && self.is_live {
            return Err(AuthError::DocsTokenSandboxRestricted.into());
        }
        Ok(self.is_live)
    }

    fn tenant(&self) -> &Tenant {
        self.data.tenant()
    }

    fn actor(&self) -> AuthActor {
        AuthActor::from(self.tenant_user.id.clone())
    }
}

impl TenantAuth for SessionContext<TenantRbAuth> {
    fn scopes(&self) -> Vec<TenantScope> {
        self.data.tenant_role.scopes.clone()
    }

    fn is_firm_employee(&self) -> bool {
        self.tenant_user.is_firm_employee
    }
}

impl<const IS_SECONDARY: bool> GetFirmEmployee for TenantRbAuthContext<IS_SECONDARY> {
    fn firm_employee_user(&self) -> FpResult<TenantUser> {
        let tu = &self.0.tenant_user;
        if !tu.is_firm_employee {
            return Err(AuthError::NotFirmEmployee.into());
        }
        Ok(tu.clone())
    }
}
