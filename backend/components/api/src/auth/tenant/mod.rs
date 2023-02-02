mod guards;
mod ob_public_key;
use std::fmt::Display;

pub use self::guards::*;
mod workos;
pub use self::workos::*;
use db::models::tenant::Tenant;
use db::models::tenant_role::TenantRole;
pub use ob_public_key::*;
mod secret_key;
pub use secret_key::*;
mod ob_session;
pub use ob_session::*;
mod tenant_rb;
pub use self::tenant_rb::*;
mod firm_employee;
pub use self::firm_employee::*;

use super::AuthError;
use super::Either;
use crate::errors::ApiError;
use newtypes::{DbActor, TenantApiKeyId, TenantScope, TenantUserId};

pub type TenantSessionAuth = Either<TenantRbAuthContext, FirmEmployeeAuthContext>;

pub trait TenantAuth {
    fn tenant(&self) -> &Tenant;
    fn is_live(&self) -> Result<bool, ApiError>;
    fn actor(&self) -> AuthActor;
}

#[derive(Clone)]
pub enum AuthActor {
    TenantUser(TenantUserId),
    TenantApiKey(TenantApiKeyId),
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
        }
    }
}

pub trait IsGuardMet: Display {
    /// Given the `token_scopes` that exist on the auth token, checks if the required permission
    /// represented by self is met.
    #[allow(clippy::wrong_self_convention)]
    fn is_met(self, token_scopes: &[TenantScope]) -> bool;
}

/// A trait to be implemented for any form of tenant auth class.
/// Requires implementing `token_permissions()` and `tenant_auth()`, and then provides a default
/// implementation to check whether a guard is met by the token_permissions() and
/// yield the tenant auth if so.
/// Purposefully private to prevent calling these methods outside of this module
trait CanCheckTenantGuard: Sized {
    /// The tenant role that the authed principal has
    fn role(&self) -> &TenantRole;

    /// The list of TenantPermissions scopes that are allowed by this auth token
    fn token_scopes(&self) -> &[TenantScope] {
        &self.role().scopes
    }

    /// The boxed TenantAuth trait object that can be utilized once permissions are checked
    fn tenant_auth(self) -> Box<dyn TenantAuth>;
}

/// Implemented for tenant TAuthExtractors. Provides one function, check_permissions, that
/// _must_ be called in order to use the tenant auth class.
/// The implementation of this trait first checks that the TAuthExtractor tenant auth class's scopes are
/// sufficient to meet the guard.
/// If so, returns a usable boxed TenantAuth. Otherwise, returns an AuthError.
pub trait CheckTenantGuard {
    fn check_guard<T>(self, gaurd: T) -> Result<Box<dyn TenantAuth>, AuthError>
    where
        T: IsGuardMet;
}

impl<TAuthExtractor> CheckTenantGuard for TAuthExtractor
where
    TAuthExtractor: CanCheckTenantGuard,
{
    /// Checks if the gaurd is met by self.token_permissions().
    /// If so, returns self.tenant_auth(), otherwise returns
    fn check_guard<T>(self, gaurd: T) -> Result<Box<dyn TenantAuth>, AuthError>
    where
        T: IsGuardMet,
    {
        let requested_permission_str = format!("{}", gaurd);
        let permission_to_check = gaurd.or_admin(); // Admin user can always do anything
        if permission_to_check.is_met(self.token_scopes()) {
            Ok(self.tenant_auth())
        } else {
            Err(AuthError::MissingTenantPermission(requested_permission_str))
        }
    }
}

/// Contains some useful util methods for everything that implements IsGuardMet
pub trait TenantGuardDsl: Sized {
    /// Returns a permission that is met if self OR t is met
    fn or<U: Sized>(self, u: U) -> guards::Or<Self, U> {
        guards::Or(self, u)
    }

    /// Shorthand to return a permission that is met if self is met OR if TenantGuard::Admin
    /// is met
    fn or_admin(self) -> guards::Or<Self, TenantGuard> {
        self.or(TenantGuard::Admin)
    }
}

impl<T> TenantGuardDsl for T where T: IsGuardMet {}
