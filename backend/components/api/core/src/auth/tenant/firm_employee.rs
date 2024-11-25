use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::LoadSessionContext;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::FpResult;
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_user::TenantUser;
use db::PgConn;
use newtypes::TenantSessionPurpose;
use newtypes::WorkosAuthMethod;
use paperclip::actix::Apiv2Security;

#[derive(Debug, Clone)]
/// Represents an auth session for a firm employee, regardless of whether they are currently
/// assuming another tenant or logged in as a normal tenant_rb session.
/// This is generally only used for internal-facing APIs
pub struct FirmEmployeeAuth {
    pub tenant_user: TenantUser,
    pub auth_method: WorkosAuthMethod,
    pub purpose: TenantSessionPurpose,
}

/// Nests a private FirmEmployeeAuth and implements traits required to extract this session from an
/// actix request.
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
        conn: &mut PgConn,
        auth_session: AuthSessionData,
        _: LoadSessionContext,
    ) -> FpResult<Self> {
        // Uniquely, this kind of auth allows extracting the user from two different types of tokens
        let (tenant_user, auth_method, purpose) = match auth_session {
            AuthSessionData::TenantRb(data) => {
                let (_, rb, _, _) = TenantRolebinding::get(conn, &data.tenant_rolebinding_id)?;
                let tu = TenantUser::get_firm_employee(conn, &rb.tenant_user_id)?;
                (tu, data.auth_method, data.purpose)
            }
            AuthSessionData::FirmEmployee(data) => {
                let tu = TenantUser::get_firm_employee(conn, &data.tenant_user_id)?;
                (tu, data.auth_method, data.purpose)
            }
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        if !tenant_user.is_firm_employee {
            // Double-checking for safety
            return Err(AuthError::NotFirmEmployee.into());
        }

        tracing::info!(tenant_user_id=%tenant_user.id, "Authenticated as firm employee");
        Ok(Self(FirmEmployeeAuth {
            tenant_user,
            auth_method,
            purpose,
        }))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("auth_method", "firm_employee");
    }
}

pub enum FirmEmployeeGuard {
    /// Don't require any special permissions.
    /// NOTE: some tokens used in integration testing have this permission
    Any,
    /// Require the authed firm employee is in the "risk ops" group
    RiskOps,
}

impl FirmEmployeeAuthContext {
    pub fn check_guard(self, guard: FirmEmployeeGuard) -> FpResult<SessionContext<FirmEmployeeAuth>> {
        match guard {
            FirmEmployeeGuard::Any => (),
            FirmEmployeeGuard::RiskOps => {
                if !self.0.tenant_user.is_risk_ops {
                    return Err(AuthError::NotRiskOpsFirmEmployee.into());
                }
            }
        }
        let result = self.map(|i| i.0);
        Ok(result)
    }
}
