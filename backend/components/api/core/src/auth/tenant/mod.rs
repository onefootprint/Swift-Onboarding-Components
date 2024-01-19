mod guards;
pub use self::guards::*;
mod workos;
pub use self::workos::*;
use async_trait::async_trait;
use db::models::tenant::Tenant;
use db::models::tenant_user::TenantUser;

mod secret_key;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSource;
use newtypes::WorkosAuthMethod;
pub use secret_key::*;
mod tenant_rb;
pub use self::tenant_rb::*;
mod firm_employee_assume;
pub use self::firm_employee_assume::*;
mod client;
pub use client::*;
mod firm_employee;
pub use firm_employee::*;

use super::Any;
use super::AuthError;
use super::CanDecrypt;
use super::Either;
use super::IsGuardMet;
use super::Or;
use super::SessionContext;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::errors::ValidationError;
use crate::State;
use newtypes::{DbActor, TenantApiKeyId, TenantScope, TenantUserId};

pub type TenantSessionAuth = Either<TenantRbAuthContext, FirmEmployeeAssumeAuthContext>;

pub type AnyTenantSessionAuth = Either<SessionContext<WorkOsSessionData>, TenantSessionAuth>;

impl AnyTenantSessionAuth {
    /// The different types of session auths have very different purposes, so we have to do some
    /// branching to extract the tenant_user_id
    pub fn tenant_user_id(self) -> ApiResult<TenantUserId> {
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

    pub fn auth_method(&self) -> WorkosAuthMethod {
        match self {
            Either::Left(l) => l.data.auth_method,
            Either::Right(r) => r.auth_method(),
        }
    }
}

impl TenantSessionAuth {
    pub fn auth_method(&self) -> WorkosAuthMethod {
        match self {
            Either::Left(l) => l.data.0.auth_method,
            Either::Right(r) => r.data.0.auth_method,
        }
    }
}

pub trait TenantAuth {
    fn tenant(&self) -> &Tenant;
    fn is_live(&self) -> Result<bool, ApiError>;
    fn actor(&self) -> AuthActor;
    fn scopes(&self) -> Vec<TenantScope>;
    fn source(&self) -> DataLifetimeSource;
    /// Returns whether the auth scopes granted to this actor can decrypt the provided DI
    fn actor_can_decrypt(&self, di: DataIdentifier) -> bool {
        CanDecrypt::single(di).or_admin().is_met(&self.scopes())
    }
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
/// Requires implementing `token_permissions()` and `tenant_auth()`, and then provides a default
/// implementation to check whether a guard is met by the token_permissions() and
/// yield the tenant auth if so.
/// Purposefully private to prevent calling these methods outside of this module
trait CanCheckTenantGuard: Sized {
    /// The list of TenantPermissions scopes that are allowed by this auth token
    /// Though the impl is usually the same, don't provide a default since using Either will
    /// overwrite any custom impl
    fn token_scopes(&self) -> Vec<TenantScope>;

    /// The boxed TenantAuth trait object that can be utilized once permissions are checked
    fn tenant_auth(self) -> Box<dyn TenantAuth>;
}

/// Implemented for tenant TAuthExtractors. Provides one function, check_permissions, that
/// _must_ be called in order to use the tenant auth class.
/// The implementation of this trait first checks that the TAuthExtractor tenant auth class's scopes are
/// sufficient to meet the guard.
/// If so, returns a usable boxed TenantAuth. Otherwise, returns an AuthError.
pub trait CheckTenantGuard: Sized {
    /// Checks if the guard is met by self.token_permissions().
    /// If so, returns self.tenant_auth(), otherwise returns an auth error
    fn check_guard<T>(self, guard: T) -> Result<Box<dyn TenantAuth>, AuthError>
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

impl<TAuthExtractor> CheckTenantGuard for TAuthExtractor
where
    TAuthExtractor: CanCheckTenantGuard,
{
    fn check_guard<T>(self, guard: T) -> Result<Box<dyn TenantAuth>, AuthError>
    where
        T: IsGuardMet<TenantScope>,
    {
        self.check_one_guard(guard)?;
        Ok(self.tenant_auth())
    }

    fn check_one_guard<T>(&self, guard: T) -> Result<(), AuthError>
    where
        T: IsGuardMet<TenantScope>,
    {
        let requested_permission_str = format!("{}", guard);
        let permission_to_check = guard.or_admin(); // Admin user can always do anything
        if permission_to_check.is_met(&self.token_scopes()) {
            Ok(())
        } else {
            Err(AuthError::MissingTenantPermission(requested_permission_str))
        }
    }

    fn token_scopes(&self) -> Vec<TenantScope> {
        CanCheckTenantGuard::token_scopes(self)
    }
}

/// Contains some useful util methods for everything that implements IsGuardMet
pub trait TenantGuardDsl: Sized + IsGuardMet<TenantScope> {
    /// Shorthand to return a permission that is met if self is met OR if TenantGuard::Admin
    /// is met
    fn or_admin(self) -> Or<Self, TenantGuard> {
        self.or(TenantGuard::Admin)
    }
}

impl<T> TenantGuardDsl for T where T: IsGuardMet<TenantScope> {}
