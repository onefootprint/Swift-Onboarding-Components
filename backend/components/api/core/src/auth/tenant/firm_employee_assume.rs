use super::AuthActor;
use super::CanCheckTenantGuard;
use super::GetFirmEmployee;
use super::TenantAuth;
use crate::auth::session::get_is_live;
use crate::auth::session::tenant::FirmEmployeeSession;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::utils::headers::get_bool_header;
use crate::FpResult;
use db::models::tenant::Tenant;
use db::models::tenant_role::ImmutableRoleKind;
use db::models::tenant_role::TenantRole;
use db::models::tenant_user::TenantUser;
use db::PgConn;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use itertools::Itertools;
use newtypes::TenantRoleKind;
use newtypes::TenantScope;
use newtypes::TenantSessionPurpose;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

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
    pub(super) data: FirmEmployeeSession,
}

/// Nests a private FirmEmployeeAssumeAuth and implements traits required to extract this session
/// from an actix request.
/// Notably, this struct isn't very useful since the entire nested FirmEmployeeAssumeAuth is hidden.
/// If you want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested FirmEmployeeAssumeAuth
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Firm Employee Assume Token",
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Short-lived auth token for a firm-employee dashboard user assuming a tenant."
)]
pub struct ParsedFirmEmployeeAssumeAuth<const IS_SECONDARY: bool>(pub(super) FirmEmployeeAssumeAuth);

/// A shorthand for the extractor for an auth session in which a firm employee has assumed anther
/// tenant
pub type FirmEmployeeAssumeAuthContext<const IS_SECONDARY: bool> =
    SessionContext<ParsedFirmEmployeeAssumeAuth<IS_SECONDARY>>;

impl<const IS_SECONDARY: bool> ExtractableAuthSession for ParsedFirmEmployeeAssumeAuth<IS_SECONDARY> {
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
        ff_client: Arc<dyn FeatureFlagClient>,
        req: RequestInfo,
    ) -> FpResult<Self> {
        let data = match auth_session {
            AuthSessionData::FirmEmployee(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let tenant_user = TenantUser::get_firm_employee(conn, &data.tenant_user_id)?;
        if tenant_user.email.is_integration_test_email() && !data.tenant_id.is_integration_test_tenant() {
            return Err(AuthError::NotAllowedForIntegrationTestUser.into());
        }
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
            data,
            requested_allow_writes: allow_writes,
        }))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.0.tenant.id.to_string());
        root_span.record("is_live", self.0.is_live);
        root_span.record("auth_method", "firm_employee_assume");
    }
}

impl<const IS_SECONDARY: bool> GetFirmEmployee for FirmEmployeeAssumeAuthContext<IS_SECONDARY> {
    fn firm_employee_user(&self) -> FpResult<TenantUser> {
        let tu = &self.0.tenant_user;
        if !tu.is_firm_employee {
            // TODO should we hide these errors with 404s?
            return Err(AuthError::NotFirmEmployee.into());
        }
        Ok(tu.clone())
    }
}

impl FirmEmployeeAssumeAuth {
    fn token_scopes(&self) -> Vec<TenantScope> {
        let extra_permissions_for_user = if self.requested_allow_writes {
            // To receive an extra permissions, the dashboard must send an explicit header that
            // shows the user has enabled write mode on the dashboard
            if !self.is_live {
                // In sandbox mode, all firm employees are allowed to have write access
                vec![TenantScope::Admin]
            } else if self.is_risk_ops {
                // Outside of sandbox, "risk ops" employees have some extended permissions
                vec![
                    TenantScope::OrgSettings,
                    TenantScope::DecryptAllExceptPciData,
                    TenantScope::ManualReview,
                    TenantScope::WriteEntities,
                    TenantScope::OnboardingConfiguration,
                    TenantScope::ApiKeys,
                    TenantScope::ManageWebhooks,
                ]
            } else {
                // But, firm employees are always allowed to edit org settings
                vec![TenantScope::OrgSettings]
            }
        } else {
            vec![]
        };
        self.role
            .scopes
            .iter()
            .cloned()
            .chain(extra_permissions_for_user)
            .unique()
            .collect()
    }
}

impl<const IS_SECONDARY: bool> CanCheckTenantGuard for FirmEmployeeAssumeAuthContext<IS_SECONDARY> {
    type Auth = Box<dyn TenantAuth>;

    fn raw_token_scopes(&self) -> Vec<TenantScope> {
        self.0.token_scopes()
    }

    fn auth(self) -> Box<dyn TenantAuth> {
        Box::new(self.map(|d| d.0))
    }

    fn purpose(&self) -> Option<TenantSessionPurpose> {
        Some(self.data.0.data.purpose)
    }
}

impl TenantAuth for SessionContext<FirmEmployeeAssumeAuth> {
    fn is_live(&self) -> FpResult<bool> {
        if self.tenant.sandbox_restricted && self.is_live {
            // error if the tenant is sandbox-restricted but is requesting live data
            return Err(AuthError::SandboxRestricted.into());
        }
        if self.data.data.purpose == TenantSessionPurpose::Docs && self.is_live {
            return Err(AuthError::DocsTokenSandboxRestricted.into());
        }
        Ok(self.is_live)
    }

    fn tenant(&self) -> &Tenant {
        &self.tenant
    }

    fn actor(&self) -> AuthActor {
        AuthActor::FirmEmployee(self.tenant_user.id.clone())
    }
}

#[cfg(test)]
mod test {
    use super::super::CanCheckTenantGuard;
    use super::FirmEmployeeAssumeAuth;
    use super::ParsedFirmEmployeeAssumeAuth;
    use crate::auth::session::tenant::FirmEmployeeSession;
    use crate::auth::session::AuthSessionData;
    use crate::auth::SessionContext;
    use db::models::tenant_role::ImmutableRoleKind;
    use db::models::tenant_role::TenantRole;
    use db::tests::prelude::*;
    use macros::db_test_case;
    use newtypes::TenantRoleKind;
    use newtypes::TenantScope;
    use newtypes::TenantSessionPurpose;
    use newtypes::WorkosAuthMethod;

    #[db_test_case(false, false, false => vec![TenantScope::Read])]
    #[db_test_case(false, true, false => vec![TenantScope::Read])]
    #[db_test_case(true, false, false => vec![TenantScope::Read])]
    #[db_test_case(true, true, false => vec![TenantScope::Read])]
    #[db_test_case(false, false, true => vec![TenantScope::Read, TenantScope::Admin]; "always have admin in sandbox")]
    #[db_test_case(false, true, true => vec![TenantScope::Read, TenantScope::Admin]; "always have admin in sandbox, even risk ops")]
    #[db_test_case(true, false, true => vec![TenantScope::Read, TenantScope::OrgSettings]; "always have org settings in live mode")]
    #[db_test_case(true, true, true => vec![
        TenantScope::Read,
        TenantScope::OrgSettings,
        TenantScope::DecryptAllExceptPciData,
        TenantScope::ManualReview,
        TenantScope::WriteEntities,
        TenantScope::OnboardingConfiguration,
        TenantScope::ApiKeys,
        TenantScope::ManageWebhooks,
    ]; "risk ops has lots of permissions in live mode")]
    fn test_roles(
        conn: &mut TestPgConn,
        is_live: bool,
        is_risk_ops: bool,
        // If requested_allow_writes is ever false, we shouldn't have any permissions beyond Read
        requested_allow_writes: bool,
    ) -> Vec<TenantScope> {
        let tenant = db::tests::fixtures::tenant::create(conn);
        let role_kind = TenantRoleKind::DashboardUser;
        let role =
            TenantRole::get_immutable(conn, &tenant.id, ImmutableRoleKind::ReadOnly, role_kind).unwrap();
        let tenant_user = db::tests::fixtures::tenant_user::create(conn);
        let session_data = FirmEmployeeSession {
            tenant_user_id: tenant_user.id.clone(),
            tenant_id: tenant.id.clone(),
            auth_method: WorkosAuthMethod::GoogleOauth,
            purpose: TenantSessionPurpose::Dashboard,
        };
        let data = FirmEmployeeAssumeAuth {
            tenant,
            tenant_user,
            role,
            is_risk_ops,
            is_live,
            data: session_data.clone(),
            requested_allow_writes,
        };
        let data = ParsedFirmEmployeeAssumeAuth::<false>(data);
        let auth = SessionContext::create_fixture(data, AuthSessionData::FirmEmployee(session_data));
        auth.raw_token_scopes()
    }
}
