use super::{AuthActor, CanCheckTenantGuard, TenantAuth};
use crate::{
    auth::{
        session::{AuthSessionData, ExtractableAuthSession},
        AuthError, SessionContext,
    },
    errors::ApiResult,
    feature_flag::{FeatureFlagClient, LaunchDarklyFeatureFlagClient},
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
use newtypes::{TenantId, TenantScope, TenantUserId};
use paperclip::actix::{Apiv2Schema, Apiv2Security};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
/// The struct that is serialized and saved into the session table in the DB for a firm employee
/// session token.
/// The session token is used to look up this session info, and this session info is used to fetch
/// the related user and tenant information from the DB
pub struct FirmEmployeeSession {
    /// The TenantUserId that is proven to be owned via a workos auth.
    /// Must be a TenantUser with is_firm_employee=true
    pub tenant_user_id: TenantUserId,
    /// The TenantId whose role is being assumed by this firm employee
    pub tenant_id: TenantId,
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
    in = "header",
    name = "X-Fp-Dashboard-Authorization",
    description = "Auth token for a dashboard user"
)]
pub struct ParsedFirmEmployeeAuth(FirmEmployeeAuth);

/// A shorthand for the extractor for a firm employee auth session
pub type FirmEmployeeAuthContext = SessionContext<ParsedFirmEmployeeAuth>;

impl ExtractableAuthSession for ParsedFirmEmployeeAuth {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_from(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        ff_client: LaunchDarklyFeatureFlagClient,
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

        let is_risk_ops = ff_client
            .bool_flag_with_key(LaunchDarklyFeatureFlagClient::IS_RISK_OPS, &tenant_user.email)
            .unwrap_or(false);

        tracing::info!(tenant_id=%tenant.id, tenant_user_id=%tenant_user.id, "Authenticated as firm employee");
        Ok(Self(FirmEmployeeAuth {
            tenant,
            tenant_user,
            role,
            is_risk_ops,
        }))
    }
}

impl CanCheckTenantGuard for FirmEmployeeAuthContext {
    fn role(&self) -> &TenantRole {
        &self.data.0.role
    }

    fn token_scopes(&self) -> Vec<TenantScope> {
        // TODO check if there's a header that approves write access
        self.role()
            .scopes
            .iter()
            .cloned()
            .chain(self.data.0.is_risk_ops.then_some(TenantScope::ManualReview))
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
        let is_sandbox_restricted = self.data.tenant.sandbox_restricted;
        if is_sandbox_restricted && is_live == Some(true) {
            return Err(AuthError::SandboxRestricted.into());
        }

        // otherwise return the default of the sent header or live if not restricted
        Ok(is_live.unwrap_or(!is_sandbox_restricted))
    }

    fn tenant(&self) -> &Tenant {
        &self.data.tenant
    }

    fn role(&self) -> &TenantRole {
        &self.data.role
    }

    fn rolebinding(&self) -> Option<&TenantRolebinding> {
        None
    }

    fn actor(&self) -> AuthActor {
        AuthActor::FirmEmployee(self.data.tenant_user.id.clone())
    }
}

#[cfg(test)]
mod test {
    use super::super::CanCheckTenantGuard;
    use super::{FirmEmployeeAuth, FirmEmployeeSession, ParsedFirmEmployeeAuth};
    use crate::auth::{session::AuthSessionData, SessionContext};
    use db::tests::prelude::*;
    use macros::db_test_case;
    use newtypes::TenantScope;

    #[db_test_case(false => vec![TenantScope::Read])]
    #[db_test_case(true => vec![TenantScope::Read, TenantScope::ManualReview])]
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
