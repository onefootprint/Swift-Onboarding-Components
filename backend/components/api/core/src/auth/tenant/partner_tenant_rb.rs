use super::AuthActor;
use super::CanCheckTenantGuard;
use super::PartnerTenantAuth;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::FpResult;
use db::helpers::TenantOrPartnerTenant;
use db::models::partner_tenant::PartnerTenant;
use db::models::tenant_role::TenantRole;
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_user::TenantUser;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use newtypes::TenantScope;
use newtypes::WorkosAuthMethod;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

#[derive(Debug, Clone)]
/// Represents all partner tenant info identified by a TenantRbSession token. This struct is
/// hydrated from the DB using the information on the TenantRbSession.
pub struct PartnerTenantRbAuth {
    partner_tenant: PartnerTenant,
    tenant_role: TenantRole,
    tenant_user: TenantUser,
    tenant_rolebinding: TenantRolebinding,
    // TODO: this won't be dead code once we implement assume auth for partner tenants.
    #[allow(dead_code)]
    pub(super) auth_method: WorkosAuthMethod,
}

/// Nests a private PartnerTenantRbAuth and implements traits required to extract this session from
/// an actix request.
///
/// Notably, this struct isn't very useful since the entire nested PartnerTenantRbAuth is hidden.
/// If you want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested Partner TenantRbAuth
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Dashboard Token",
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Short-lived token for an authenticated dashboard user."
)]
pub struct ParsedPartnerTenantRbAuth(pub(super) PartnerTenantRbAuth);

impl ExtractableAuthSession for ParsedPartnerTenantRbAuth {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
        _: RequestInfo,
    ) -> FpResult<Self> {
        let data = match auth_session {
            AuthSessionData::TenantRb(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (tu, rb, tr, t_pt) = TenantRolebinding::get(conn, &data.tenant_rolebinding_id)?;
        let partner_tenant = match t_pt {
            TenantOrPartnerTenant::PartnerTenant(partner_tenant) => partner_tenant,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };

        tracing::info!(partner_tenant_id=%partner_tenant.id, tenant_role_id=%tr.id, tenant_rb_id=%rb.id, tenant_user_id=%tu.id, "authenticated");

        Ok(Self(PartnerTenantRbAuth {
            partner_tenant,
            tenant_rolebinding: rb,
            tenant_role: tr,
            tenant_user: tu,
            auth_method: data.auth_method,
        }))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("partner_tenant_id", &self.0.partner_tenant.id.to_string());
        root_span.record("auth_method", "partner_tenant_rb");
    }
}

impl SessionContext<ParsedPartnerTenantRbAuth> {
    pub fn rolebinding(&self) -> Option<&TenantRolebinding> {
        Some(&self.0.tenant_rolebinding)
    }
}

impl PartnerTenantRbAuth {
    pub fn partner_tenant(&self) -> &PartnerTenant {
        &self.partner_tenant
    }
}

/// A shorthand for the commonly used ParsedPartnerTenantRbAuth context
pub type PartnerTenantRbAuthContext = SessionContext<ParsedPartnerTenantRbAuth>;

impl CanCheckTenantGuard for PartnerTenantRbAuthContext {
    type Auth = Box<dyn PartnerTenantAuth>;

    fn token_scopes(&self) -> Vec<TenantScope> {
        self.0.tenant_role.scopes.clone()
    }

    fn auth(self) -> Box<dyn PartnerTenantAuth> {
        Box::new(self.map(|d| d.0))
    }
}

impl PartnerTenantAuth for SessionContext<PartnerTenantRbAuth> {
    fn partner_tenant(&self) -> &PartnerTenant {
        self.data.partner_tenant()
    }

    fn actor(&self) -> AuthActor {
        AuthActor::from(self.tenant_user.id.clone())
    }

    fn scopes(&self) -> Vec<TenantScope> {
        self.tenant_role.scopes.clone()
    }
}
