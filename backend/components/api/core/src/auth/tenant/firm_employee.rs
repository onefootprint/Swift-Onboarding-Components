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
        tenant_rolebinding::TenantRolebinding,
        tenant_user::TenantUser,
    },
    PgConn,
};
use feature_flag::{BoolFlag, FeatureFlagClient};
use newtypes::{CollectedDataOption, TenantScope};
use paperclip::actix::Apiv2Security;
use strum::IntoEnumIterator;

/// Risk ops users can perform manual review and decrypt info
fn risk_ops_permissions() -> Vec<TenantScope> {
    CollectedDataOption::iter()
        .map(TenantScope::Decrypt)
        .chain([TenantScope::ManualReview, TenantScope::DecryptCustom])
        .collect()
}

#[derive(Debug, Clone)]
/// Represents all tenant info identified by a workos session token. This struct is hydrated from
/// the DB using the information on the FirmEmployeeSession
pub struct FirmEmployeeAuth {
    tenant: Tenant,
    tenant_user: TenantUser,
    role: TenantRole,
    is_risk_ops: bool,
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
    description = "Short-lived auth token for a firm employee dashboard user"
)]
pub struct ParsedFirmEmployeeAuth(FirmEmployeeAuth);

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
        let role = TenantRole::get_immutable(conn, &tenant.id, ImmutableRoleKind::ReadOnly)?;

        let is_risk_ops = ff_client.flag(BoolFlag::IsRiskOps(&tenant_user.email));

        tracing::info!(tenant_id=%tenant.id, tenant_user_id=%tenant_user.id, "Authenticated as firm employee");
        Ok(Self(FirmEmployeeAuth {
            tenant,
            tenant_user,
            role,
            is_risk_ops,
        }))
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

impl CanCheckTenantGuard for FirmEmployeeAuthContext {
    fn role(&self) -> &TenantRole {
        &self.0.role
    }

    fn token_scopes(&self) -> Vec<TenantScope> {
        // TODO check if there's a header that approves write access
        let extra_permissions_for_user = if self.0.is_risk_ops {
            risk_ops_permissions()
        } else {
            vec![]
        };
        self.role()
            .scopes
            .iter()
            .cloned()
            .chain(extra_permissions_for_user)
            .collect()
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

    fn rolebinding(&self) -> Option<&TenantRolebinding> {
        None
    }

    fn actor(&self) -> AuthActor {
        AuthActor::FirmEmployee(self.tenant_user.id.clone())
    }
}

#[cfg(test)]
mod test {
    use super::super::CanCheckTenantGuard;
    use super::{FirmEmployeeAuth, ParsedFirmEmployeeAuth};
    use crate::auth::session::tenant::FirmEmployeeSession;
    use crate::auth::{session::AuthSessionData, SessionContext};
    use db::tests::prelude::*;
    use macros::db_test_case;
    use newtypes::{CollectedDataOption, TenantScope};

    #[db_test_case(false => vec![TenantScope::Read])]
    #[db_test_case(true => vec![
        TenantScope::Read,
        TenantScope::Decrypt(CollectedDataOption::Name),
        TenantScope::Decrypt(CollectedDataOption::Dob),
        TenantScope::Decrypt(CollectedDataOption::Ssn4),
        TenantScope::Decrypt(CollectedDataOption::Ssn9),
        TenantScope::Decrypt(CollectedDataOption::FullAddress),
        TenantScope::Decrypt(CollectedDataOption::PartialAddress),
        TenantScope::Decrypt(CollectedDataOption::Email),
        TenantScope::Decrypt(CollectedDataOption::PhoneNumber),
        TenantScope::Decrypt(CollectedDataOption::Nationality),
        TenantScope::Decrypt(CollectedDataOption::Document),
        TenantScope::Decrypt(CollectedDataOption::DocumentAndSelfie),
        TenantScope::Decrypt(CollectedDataOption::BusinessName),
        TenantScope::Decrypt(CollectedDataOption::BusinessTin),
        TenantScope::Decrypt(CollectedDataOption::BusinessAddress),
        TenantScope::Decrypt(CollectedDataOption::BusinessPhoneNumber),
        TenantScope::Decrypt(CollectedDataOption::BusinessWebsite),
        TenantScope::Decrypt(CollectedDataOption::BusinessBeneficialOwners),
        TenantScope::Decrypt(CollectedDataOption::BusinessKycedBeneficialOwners),
        TenantScope::Decrypt(CollectedDataOption::BusinessCorporationType),
        TenantScope::Decrypt(CollectedDataOption::InvestorProfile),
        TenantScope::ManualReview,
        TenantScope::DecryptCustom,
    ])]
    fn test_roles(conn: &mut TestPgConn, is_risk_ops: bool) -> Vec<TenantScope> {
        let tenant = db::tests::fixtures::tenant::create(conn);
        let role = db::tests::fixtures::tenant_role::create_ro(conn, &tenant.id);
        let tenant_user = db::tests::fixtures::tenant_user::create(conn);
        let session_data = AuthSessionData::FirmEmployee(FirmEmployeeSession {
            tenant_user_id: tenant_user.id.clone(),
            tenant_id: tenant.id.clone(),
        });
        let data = FirmEmployeeAuth {
            tenant,
            tenant_user,
            role,
            is_risk_ops,
        };
        let data = ParsedFirmEmployeeAuth(data);
        let auth = SessionContext::create_fixture(data, session_data);
        auth.token_scopes()
    }
}
