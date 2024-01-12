use std::sync::Arc;

use super::{AuthActor, CanCheckTenantGuard, GetFirmEmployee, TenantAuth};
use crate::{
    auth::{
        session::{get_is_live, AllowSessionUpdate, AuthSessionData, ExtractableAuthSession, RequestInfo},
        AuthError, SessionContext,
    },
    errors::ApiResult,
    utils::headers::get_bool_header,
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
pub struct FirmEmployeeAssumeAuth {
    tenant: Tenant,
    tenant_user: TenantUser,
    role: TenantRole,
    is_risk_ops: bool,
    is_live: bool,
    /// True if the request from the client includes a header to allow write operations.
    /// This forces clients to explicitly acknowledge they're performing write actions on behalf of
    /// a tenant.
    requested_allow_writes: bool,
    pub(super) auth_method: WorkosAuthMethod,
}

/// Nests a private FirmEmployeeAssumeAuth and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested FirmEmployeeAssumeAuth is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested FirmEmployeeAssumeAuth
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Firm Employee Assume Token",
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Short-lived auth token for a firm-employee dashboard user assuming a tenant."
)]
pub struct ParsedFirmEmployeeAssumeAuth(pub(super) FirmEmployeeAssumeAuth);

/// A shorthand for the extractor for an auth session in which a firm employee has assumed anther tenant
pub type FirmEmployeeAssumeAuthContext = SessionContext<ParsedFirmEmployeeAssumeAuth>;

impl ExtractableAuthSession for ParsedFirmEmployeeAssumeAuth {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        ff_client: Arc<dyn FeatureFlagClient>,
        req: RequestInfo,
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
        // This is the magic of the FirmEmployeeAssumeAuthContet: firm employees only ever have read
        // permissions for other tenants
        let kind = TenantRoleKind::DashboardUser;
        let role = TenantRole::get_immutable(conn, &tenant.id, ImmutableRoleKind::ReadOnly, kind)?;

        let is_risk_ops = ff_client.flag(BoolFlag::IsRiskOps(&tenant_user.email));
        let is_live = get_is_live(&req).unwrap_or(!tenant.sandbox_restricted);
        let allow_writes = get_bool_header("x-allow-assumed-writes", &req.headers).unwrap_or(false);

        tracing::info!(tenant_id=%tenant.id, tenant_user_id=%tenant_user.id, "Authenticated as firm employee in assume session");
        Ok(Self(FirmEmployeeAssumeAuth {
            tenant,
            tenant_user,
            role,
            is_risk_ops,
            is_live,
            auth_method: data.auth_method,
            requested_allow_writes: allow_writes,
        }))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.0.tenant.id.to_string());
        root_span.record("is_live", self.0.is_live);
        root_span.record("auth_method", "firm_employee_assume");
    }
}

impl GetFirmEmployee for FirmEmployeeAssumeAuthContext {
    fn firm_employee_user(&self) -> ApiResult<TenantUser> {
        let tu = &self.0.tenant_user;
        if !tu.is_firm_employee {
            // TODO should we hide these errors with 404s?
            return Err(AuthError::NotFirmEmployee.into());
        }
        Ok(tu.clone())
    }
}

// Allow calling SessionContext<T>::update for T=ParsedFirmEmployeeAssumeAuth, only for mutating a token to be used
// for impersonation
impl AllowSessionUpdate for ParsedFirmEmployeeAssumeAuth {}

impl FirmEmployeeAssumeAuth {
    fn token_scopes(&self) -> Vec<TenantScope> {
        // TODO check if there's a header that approves write access
        let extra_permissions_for_user = if self.is_risk_ops && self.requested_allow_writes {
            vec![
                TenantScope::DecryptAll,
                TenantScope::ManualReview,
                TenantScope::WriteEntities,
                TenantScope::OnboardingConfiguration,
                TenantScope::ApiKeys,
                TenantScope::ManageWebhooks,
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

impl CanCheckTenantGuard for FirmEmployeeAssumeAuthContext {
    fn token_scopes(&self) -> Vec<TenantScope> {
        self.0.token_scopes()
    }

    fn tenant_auth(self) -> Box<dyn TenantAuth> {
        Box::new(self.map(|d| d.0))
    }
}

impl TenantAuth for SessionContext<FirmEmployeeAssumeAuth> {
    fn is_live(&self) -> ApiResult<bool> {
        if self.tenant.sandbox_restricted && self.is_live {
            // error if the tenant is sandbox-restricted but is requesting live data
            return Err(AuthError::SandboxRestricted.into());
        }
        Ok(self.is_live)
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
    use super::{FirmEmployeeAssumeAuth, ParsedFirmEmployeeAssumeAuth};
    use crate::auth::session::tenant::FirmEmployeeSession;
    use crate::auth::{session::AuthSessionData, SessionContext};
    use db::models::tenant_role::{ImmutableRoleKind, TenantRole};
    use db::tests::prelude::*;
    use macros::db_test_case;
    use newtypes::{TenantRoleKind, TenantScope, WorkosAuthMethod};

    #[db_test_case(false, false => vec![TenantScope::Read])]
    #[db_test_case(false, true => vec![TenantScope::Read])]
    #[db_test_case(true, false => vec![TenantScope::Read])]
    #[db_test_case(true, true => vec![
        TenantScope::Read,
        TenantScope::DecryptAll,
        TenantScope::ManualReview,
        TenantScope::WriteEntities,
        TenantScope::OnboardingConfiguration,
        TenantScope::ApiKeys,
        TenantScope::ManageWebhooks,
    ])]
    fn test_roles(
        conn: &mut TestPgConn,
        requested_allow_writes: bool,
        is_risk_ops: bool,
    ) -> Vec<TenantScope> {
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
        let data = FirmEmployeeAssumeAuth {
            tenant,
            tenant_user,
            role,
            is_risk_ops,
            is_live: true,
            auth_method: WorkosAuthMethod::GoogleOauth,
            requested_allow_writes,
        };
        let data = ParsedFirmEmployeeAssumeAuth(data);
        let auth = SessionContext::create_fixture(data, session_data);
        auth.token_scopes()
    }
}
