mod guards;
pub use self::guards::*;
mod workos;
pub use self::workos::*;
use async_trait::async_trait;
use db::models::tenant::Tenant;
use db::models::tenant_user::TenantUser;

mod secret_key;
pub use secret_key::*;
mod tenant_rb;
pub use self::tenant_rb::*;
mod firm_employee;
pub use self::firm_employee::*;
mod client;
pub use client::*;

use super::Any;
use super::AuthError;
use super::Either;
use super::IsGuardMet;
use super::Or;
use super::SessionContext;
use crate::errors::tenant::TenantError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::State;
use newtypes::{DbActor, TenantApiKeyId, TenantScope, TenantUserId};

pub type TenantSessionAuth = Either<TenantRbAuthContext, FirmEmployeeAuthContext>;

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
                match r.actor() {
                    AuthActor::TenantUser(tu_id) | AuthActor::FirmEmployee(tu_id) => tu_id,
                    _ => return Err(TenantError::ValidationError("Non-user principal".to_owned()).into()),
                }
            }
        };
        Ok(tu_id)
    }
}

pub trait TenantAuth {
    fn tenant(&self) -> &Tenant;
    fn is_live(&self) -> Result<bool, ApiError>;
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
