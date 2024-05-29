use super::{
    Any,
    CheckTenantGuard,
    Either,
    PartnerTenantSessionAuth,
    SessionContext,
    TenantSessionAuth,
    WorkOsSessionData,
};
use crate::errors::ApiResult;
use newtypes::{
    TenantUserId,
    WorkosAuthMethod,
};

pub type AnyTenantSessionAuth = Either<SessionContext<WorkOsSessionData>, TenantSessionAuth>;
pub type AnyPartnerTenantSessionAuth = Either<SessionContext<WorkOsSessionData>, PartnerTenantSessionAuth>;

pub trait AnyOrgSessionAuth {
    fn tenant_user_id(self) -> ApiResult<TenantUserId>;
    fn auth_method(&self) -> WorkosAuthMethod;
}

impl AnyOrgSessionAuth for AnyTenantSessionAuth {
    /// The different types of session auths have very different purposes, so we have to do some
    /// branching to extract the tenant_user_id
    fn tenant_user_id(self) -> ApiResult<TenantUserId> {
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
}

impl AnyOrgSessionAuth for AnyPartnerTenantSessionAuth {
    fn tenant_user_id(self) -> ApiResult<TenantUserId> {
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
}
