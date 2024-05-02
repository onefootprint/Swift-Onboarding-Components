mod any_org;
pub use any_org::*;
mod client;
pub use client::*;
mod firm_employee;
use db::models::partner_tenant::PartnerTenant;
pub use firm_employee::*;
mod firm_employee_assume;
pub use self::firm_employee_assume::*;
mod guards;
pub use self::guards::*;
mod partner_tenant_rb;
pub use self::partner_tenant_rb::*;
mod secret_key;
pub use secret_key::*;
mod tenant_or_partner_tenant;
pub use self::tenant_or_partner_tenant::*;
mod tenant_rb;
pub use self::tenant_rb::*;
mod workos;
pub use self::workos::*;

use super::{Any, AuthError, Either, IsGuardMet, SessionContext};
use crate::{
    errors::{ApiError, ApiResult, ValidationError},
    State,
};
use async_trait::async_trait;
use db::models::{tenant::Tenant, tenant_user::TenantUser};
use newtypes::{DataLifetimeSource, DbActor, TenantApiKeyId, TenantScope, TenantUserId, WorkosAuthMethod};

pub type TenantSessionAuth<const IS_SECONDARY: bool = false> =
    Either<TenantRbAuthContext<IS_SECONDARY>, FirmEmployeeAssumeAuthContext<IS_SECONDARY>>;

pub type PartnerTenantSessionAuth = PartnerTenantRbAuthContext;

pub type TenantOrPartnerTenantSessionAuth = Either<TenantSessionAuth, PartnerTenantSessionAuth>;

impl TenantSessionAuth {
    pub fn auth_method(&self) -> WorkosAuthMethod {
        match self {
            Either::Left(l) => l.data.0.auth_method,
            Either::Right(r) => r.data.0.auth_method,
        }
    }
}

impl PartnerTenantSessionAuth {
    pub fn auth_method(&self) -> WorkosAuthMethod {
        self.data.0.auth_method
    }
}

impl TenantOrPartnerTenantSessionAuth {
    pub fn check_guard(
        self,
        t_guard: TenantGuard,
        pt_guard: PartnerTenantGuard,
    ) -> ApiResult<TenantOrPartnerTenantAuth> {
        Ok(match self {
            Either::Left(t_auth) => Either::Left(t_auth.check_guard(t_guard)?),
            Either::Right(pt_auth) => Either::Right(pt_auth.check_guard(pt_guard)?),
        })
    }

    pub fn auth_method(&self) -> WorkosAuthMethod {
        match self {
            Either::Left(l) => l.auth_method(),
            Either::Right(r) => r.auth_method(),
        }
    }
}

impl From<TenantSessionAuth> for TenantOrPartnerTenantSessionAuth {
    fn from(t: TenantSessionAuth) -> Self {
        Either::Left(t)
    }
}

impl From<PartnerTenantSessionAuth> for TenantOrPartnerTenantSessionAuth {
    fn from(pt: PartnerTenantSessionAuth) -> Self {
        Either::Right(pt)
    }
}

pub trait TenantAuth {
    fn tenant(&self) -> &Tenant;
    fn is_live(&self) -> Result<bool, ApiError>;
    fn actor(&self) -> AuthActor;
    fn scopes(&self) -> Vec<TenantScope>;
    fn dl_source(&self) -> DataLifetimeSource;
}

pub trait PartnerTenantAuth {
    fn partner_tenant(&self) -> &PartnerTenant;
    fn actor(&self) -> AuthActor;
    fn scopes(&self) -> Vec<TenantScope>;
}

pub trait GetFirmEmployee {
    /// Escape hatch to get the `TenantUser` for an auth session, if and only if the authed user
    /// is a firm employee.
    fn firm_employee_user(&self) -> ApiResult<TenantUser>;
}

#[async_trait]
pub trait InvalidateAuth {
    async fn invalidate(self, state: &State) -> ApiResult<()>;
}

#[derive(Clone, Debug)]
pub enum AuthActor {
    TenantUser(TenantUserId),
    TenantApiKey(TenantApiKeyId),
    FirmEmployee(TenantUserId),
}

impl AuthActor {
    pub fn tenant_user_id(&self) -> ApiResult<&TenantUserId> {
        match self {
            AuthActor::TenantUser(tu_id) | AuthActor::FirmEmployee(tu_id) => Ok(tu_id),
            _ => ValidationError("Non-user principal").into(),
        }
    }
}

impl From<TenantUserId> for AuthActor {
    fn from(tenant_user_id: TenantUserId) -> Self {
        Self::TenantUser(tenant_user_id)
    }
}

impl From<TenantApiKeyId> for AuthActor {
    fn from(tenant_api_key_id: TenantApiKeyId) -> Self {
        Self::TenantApiKey(tenant_api_key_id)
    }
}

impl From<AuthActor> for DbActor {
    fn from(auth_actor: AuthActor) -> Self {
        match auth_actor {
            AuthActor::TenantUser(tenant_user_id) => DbActor::TenantUser { id: tenant_user_id },
            AuthActor::TenantApiKey(tenant_api_key_id) => DbActor::TenantApiKey {
                id: tenant_api_key_id,
            },
            AuthActor::FirmEmployee(tenant_user_id) => DbActor::FirmEmployee { id: tenant_user_id },
        }
    }
}

/// A trait to be implemented for any form of tenant auth class.
/// Requires implementing `token_permissions()` and `auth()`, and then provides a default
/// implementation to check whether a guard is met by the token_permissions() and
/// yield the tenant auth if so.
/// Purposefully private to prevent calling these methods outside of this module
trait CanCheckTenantGuard: Sized {
    type Auth;

    /// The list of TenantPermissions scopes that are allowed by this auth token
    /// Though the impl is usually the same, don't provide a default since using Either will
    /// overwrite any custom impl
    fn token_scopes(&self) -> Vec<TenantScope>;

    /// The auth trait object (e.g. TenantAuth or PartnerTenantAuth) that can be utilized once
    /// permissions are checked
    fn auth(self) -> Self::Auth;
}

/// Implemented for tenant TAuthExtractors. Provides one function, check_permissions, that
/// _must_ be called in order to use the tenant auth class.
/// The implementation of this trait first checks that the TAuthExtractor tenant auth class's scopes are
/// sufficient to meet the guard.
/// If so, returns a usable boxed TenantAuth. Otherwise, returns an AuthError.
pub trait CheckTenantGuard: Sized {
    type Auth;

    /// Checks if the guard is met by self.token_permissions().
    /// If so, returns self.auth(), otherwise returns an auth error
    fn check_guard<T>(self, guard: T) -> Result<Self::Auth, AuthError>
    where
        T: IsGuardMet<TenantScope>;

    /// Checks if the guard is met by self.token_permissions().
    /// If so, returns Self to be reused, otherwise returns an auth error
    fn check_one_guard<T>(&self, guard: T) -> Result<(), AuthError>
    where
        T: IsGuardMet<TenantScope>;

    /// The list of TenantPermissions scopes that are allowed by this auth token
    fn token_scopes(&self) -> Vec<TenantScope>;
}

impl<TAuthExtractor, A> CheckTenantGuard for TAuthExtractor
where
    TAuthExtractor: CanCheckTenantGuard<Auth = A>,
{
    type Auth = A;

    fn check_guard<T>(self, guard: T) -> Result<A, AuthError>
    where
        T: IsGuardMet<TenantScope>,
    {
        self.check_one_guard(guard)?;
        Ok(self.auth())
    }

    fn check_one_guard<T>(&self, guard: T) -> Result<(), AuthError>
    where
        T: IsGuardMet<TenantScope>,
    {
        let requested_permission_str = format!("{}", guard);
        if guard.is_met(&self.token_scopes()) {
            Ok(())
        } else {
            Err(AuthError::MissingTenantPermission(requested_permission_str))
        }
    }

    fn token_scopes(&self) -> Vec<TenantScope> {
        CanCheckTenantGuard::token_scopes(self)
    }
}
