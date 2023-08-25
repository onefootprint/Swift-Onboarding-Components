use std::sync::Arc;

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
        tenant::Tenant,
        tenant_role::{ImmutableRoleKind, TenantRole},
        tenant_user::TenantUser,
    },
    PgConn,
};
use feature_flag::{BoolFlag, FeatureFlagClient};
use newtypes::{DataLifetimeSource, TenantRoleKind, TenantScope, WorkosAuthMethod};
use paperclip::actix::Apiv2Security;

#[derive(Debug, Clone)]
/// Represents all tenant info identified by a workos session token. This struct is hydrated from
/// the DB using the information on the FirmEmployeeSession
pub struct FirmEmployeeAuth {
    tenant: Tenant,
    tenant_user: TenantUser,
    role: TenantRole,
    is_risk_ops: bool,
    pub(super) auth_method: WorkosAuthMethod,
}

/// Nests a private FirmEmployeeAuth and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested FirmEmployeeAuth is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested FirmEmployeeAuth
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Firm Employee Token",
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Short-lived auth token for a firm-employee dashboard user."
)]
pub struct ParsedFirmEmployeeAuth(pub(super) FirmEmployeeAuth);

/// A shorthand for the extractor for a firm employee auth session
pub type FirmEmployeeAuthContext = SessionContext<ParsedFirmEmployeeAuth>;

impl ExtractableAuthSession for ParsedFirmEmployeeAuth {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        ff_client: Arc<dyn FeatureFlagClient>,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::FirmEmployee(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let tenant_user = TenantUser::get_firm_employee(conn, &data.tenant_user_id)?;
        if !tenant_user.is_firm_employee {
            // Double-checking for safety
            return Err(AuthError::NotFirmEmployee.into());
        }
        let tenant = Tenant::get(conn, &data.tenant_id)?;
        // Firm employee session _always_ has RO role
        // This is the magic of the FirmEmployeeAuthContet: firm employees only ever have read
        // permissions for other tenants
        let kind = TenantRoleKind::DashboardUser;
        let role = TenantRole::get_immutable(conn, &tenant.id, ImmutableRoleKind::ReadOnly, kind)?;

        let is_risk_ops = ff_client.flag(BoolFlag::IsRiskOps(&tenant_user.email));

        tracing::info!(tenant_id=%tenant.id, tenant_user_id=%tenant_user.id, "Authenticated as firm employee");
        Ok(Self(FirmEmployeeAuth {
            tenant,
            tenant_user,
            role,
            is_risk_ops,
            auth_method: data.auth_method,
        }))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.0.tenant.id.to_string());
        root_span.record("tenant_user_id", &self.0.tenant_user.id.to_string());
    }
}

impl GetFirmEmployee for FirmEmployeeAuthContext {
    fn firm_employee_user(&self) -> ApiResult<TenantUser> {
        let tu = &self.0.tenant_user;
        if !tu.is_firm_employee {
            // TODO should we hide these errors with 404s?
            return Err(AuthError::NotFirmEmployee.into());
        }
        Ok(tu.clone())
    }
}

// Allow calling SessionContext<T>::update for T=ParsedFirmEmployeeAuth, only for mutating a token to be used
// for impersonation
impl AllowSessionUpdate for ParsedFirmEmployeeAuth {}

impl FirmEmployeeAuth {
    fn token_scopes(&self) -> Vec<TenantScope> {
        // TODO check if there's a header that approves write access
        let extra_permissions_for_user = if self.is_risk_ops {
            vec![
                TenantScope::DecryptAll,
                TenantScope::ManualReview,
                TenantScope::OnboardingConfiguration,
                TenantScope::ApiKeys,
            ]
        } else {
            vec![]
        };
        self.role
            .scopes
            .iter()
            .cloned()
            .chain(extra_permissions_for_user)
            .collect()
    }
}

impl CanCheckTenantGuard for FirmEmployeeAuthContext {
    fn token_scopes(&self) -> Vec<TenantScope> {
        self.0.token_scopes()
    }

    fn tenant_auth(self) -> Box<dyn TenantAuth> {
        Box::new(self.map(|d| d.0))
    }
}

impl TenantAuth for SessionContext<FirmEmployeeAuth> {
    fn is_live(&self) -> ApiResult<bool> {
        // TODO dedupe this logic
        let is_live: Option<bool> = self
            .headers
            .0
            .get("x-is-live".to_owned())
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .and_then(|v| v.trim().parse::<bool>().ok());

        // error if the tenant is sandbox-restricted but is requesting live data
        let is_sandbox_restricted = self.tenant.sandbox_restricted;
        if is_sandbox_restricted && is_live == Some(true) {
            return Err(AuthError::SandboxRestricted.into());
        }

        // otherwise return the default of the sent header or live if not restricted
        Ok(is_live.unwrap_or(!is_sandbox_restricted))
    }

    fn tenant(&self) -> &Tenant {
        &self.tenant
    }

    fn actor(&self) -> AuthActor {
        AuthActor::FirmEmployee(self.tenant_user.id.clone())
    }

    fn scopes(&self) -> Vec<TenantScope> {
        self.token_scopes()
    }

    fn source(&self) -> DataLifetimeSource {
        DataLifetimeSource::Tenant
    }
}

#[cfg(test)]
mod test {
    use super::super::CanCheckTenantGuard;
    use super::{FirmEmployeeAuth, ParsedFirmEmployeeAuth};
    use crate::auth::session::tenant::FirmEmployeeSession;
    use crate::auth::{session::AuthSessionData, SessionContext};
    use db::models::tenant_role::{ImmutableRoleKind, TenantRole};
    use db::tests::prelude::*;
    use macros::db_test_case;
    use newtypes::{TenantRoleKind, TenantScope, WorkosAuthMethod};

    #[db_test_case(false => vec![TenantScope::Read])]
    #[db_test_case(true => vec![
        TenantScope::Read,
        TenantScope::DecryptAll,
        TenantScope::ManualReview,
        TenantScope::OnboardingConfiguration,
        TenantScope::ApiKeys,
    ])]
    fn test_roles(conn: &mut TestPgConn, is_risk_ops: bool) -> Vec<TenantScope> {
        let tenant = db::tests::fixtures::tenant::create(conn);
        let role_kind = TenantRoleKind::DashboardUser;
        let role =
            TenantRole::get_immutable(conn, &tenant.id, ImmutableRoleKind::ReadOnly, role_kind).unwrap();
        let tenant_user = db::tests::fixtures::tenant_user::create(conn);
        let session_data = AuthSessionData::FirmEmployee(FirmEmployeeSession {
            tenant_user_id: tenant_user.id.clone(),
            tenant_id: tenant.id.clone(),
            auth_method: WorkosAuthMethod::GoogleOauth,
        });
        let data = FirmEmployeeAuth {
            tenant,
            tenant_user,
            role,
            is_risk_ops,
            auth_method: WorkosAuthMethod::GoogleOauth,
        };
        let data = ParsedFirmEmployeeAuth(data);
        let auth = SessionContext::create_fixture(data, session_data);
        auth.token_scopes()
    }
}
