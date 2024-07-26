use super::Any;
use super::CheckTenantGuard;
use super::Either;
use super::PartnerTenantSessionAuth;
use super::SessionContext;
use super::TenantSessionAuth;
use super::WorkOsSessionData;
use crate::FpResult;
use newtypes::TenantSessionPurpose;
use newtypes::TenantUserId;
use newtypes::WorkosAuthMethod;

pub type AnyTenantSessionAuth = Either<SessionContext<WorkOsSessionData>, TenantSessionAuth>;
pub type AnyPartnerTenantSessionAuth = Either<SessionContext<WorkOsSessionData>, PartnerTenantSessionAuth>;

pub trait AnyOrgSessionAuth {
    fn tenant_user_id(self) -> FpResult<TenantUserId>;
    fn auth_method(&self) -> WorkosAuthMethod;
    fn purpose(&self) -> TenantSessionPurpose;
}

impl AnyOrgSessionAuth for AnyTenantSessionAuth {
    /// The different types of session auths have very different purposes, so we have to do some
    /// branching to extract the tenant_user_id
    fn tenant_user_id(self) -> FpResult<TenantUserId> {
        let tu_id = match self {
            // WorkOsSessions are only used for selecting an org, just pull out the tenant_user_id
            Either::Left(l) => l.data.tenant_user_id,
            // For any other session token, validate it has Any permission and then extract the user actor
            Either::Right(r) => {
                let r = r.check_guard(Any)?;
                r.actor().tenant_user_id()?.clone()
            }
        };
        Ok(tu_id)
    }

    fn auth_method(&self) -> WorkosAuthMethod {
        match self {
            Either::Left(l) => l.data.auth_method,
            Either::Right(r) => r.auth_method(),
        }
    }

    fn purpose(&self) -> TenantSessionPurpose {
        match self {
            // Will remove this soon
            Either::Left(_) => TenantSessionPurpose::Dashboard,
            Either::Right(r) => r.purpose(),
        }
    }
}

impl AnyOrgSessionAuth for AnyPartnerTenantSessionAuth {
    fn tenant_user_id(self) -> FpResult<TenantUserId> {
        let tu_id = match self {
            // WorkOsSessions are only used for selecting an org, just pull out the tenant_user_id
            Either::Left(l) => l.data.tenant_user_id,
            // For any other session token, validate it has Any permission and then extract the user actor
            Either::Right(r) => {
                let r = r.check_guard(Any)?;
                r.actor().tenant_user_id()?.clone()
            }
        };
        Ok(tu_id)
    }

    fn auth_method(&self) -> WorkosAuthMethod {
        match self {
            Either::Left(l) => l.data.auth_method,
            Either::Right(r) => r.auth_method(),
        }
    }

    fn purpose(&self) -> TenantSessionPurpose {
        match self {
            Either::Left(_) => TenantSessionPurpose::Dashboard,
            Either::Right(r) => r.purpose(),
        }
    }
}
