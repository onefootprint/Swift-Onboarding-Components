use db::{
    models::{
        ob_configuration::ObConfiguration,
        onboarding::{Onboarding, OnboardingIdentifier},
        scoped_vault::ScopedVault,
        tenant::Tenant,
    },
    PgConn,
};
use itertools::Itertools;
use newtypes::{ScopedVaultId, VaultId};
use paperclip::actix::Apiv2Security;

use super::{UserAuthGuard, UserAuthScope};
use crate::{
    auth::{
        session::{AllowSessionUpdate, AuthSessionData, ExtractableAuthSession},
        user::UserAuth,
        AuthError, IsGuardMet, SessionContext,
    },
    errors::{ApiError, ApiResult},
};
use feature_flag::LaunchDarklyFeatureFlagClient;

/// A user-specific session. Permissions for the session are defined by the set of scopes.
/// IMPORTANT: Purposefully doesn't implement TryFrom<AuthSessionData> or HeaderName to prevent
/// users from using this in an actix extractor. UserAuthContext below should be used as the
/// extractor
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct UserSession {
    pub user_vault_id: VaultId,
    pub scopes: Vec<UserAuthScope>,
}

// Allow calling SessionContext<T>::update for T=UserSession
impl AllowSessionUpdate for UserSession {}

impl UserSession {
    pub fn make(user_vault_id: VaultId, scopes: Vec<UserAuthScope>) -> AuthSessionData {
        AuthSessionData::User(Self {
            user_vault_id,
            scopes,
        })
    }

    pub fn add_scopes(self, new_scopes: Vec<UserAuthScope>) -> AuthSessionData {
        let new_scope_kinds = new_scopes.iter().map(UserAuthGuard::from).collect_vec();
        let new_scopes = self.scopes
            .into_iter()
            // Filter out any old scope of the same type
            .filter(|x| !new_scope_kinds.contains(&UserAuthGuard::from(x)))
            // And replace it with the new scope
            .chain(new_scopes.into_iter())
            .collect();
        Self::make(self.user_vault_id, new_scopes)
    }
}

#[derive(Debug)]
pub struct AuthedOnboardingInfo {
    pub user_vault_id: VaultId,
    pub onboarding: Onboarding,
    pub scoped_user: ScopedVault,
    pub ob_config: ObConfiguration,
    pub tenant: Tenant,
}

impl CheckedUserAuthContext {
    /// Extracts the scoped_user_id from the `UserAuthScope::OrgOnboardingInit` scope on this
    /// session, if exists
    pub fn scoped_user_id(&self) -> Option<ScopedVaultId> {
        self.data
            .scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::OrgOnboardingInit { id } => Some(id.clone()),
                _ => None,
            })
            .next()
    }

    /// Extracts the business vault_id from the `UserAuthScope::Business` scope on this session, if
    /// exists
    pub fn scoped_business_id(&self) -> Option<ScopedVaultId> {
        self.data
            .scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::Business(id) => Some(id.clone()),
                _ => None,
            })
            .next()
    }

    /// Extracts the business onboarding from the `UserAuthScope::Business` scope on this session,
    /// if exists
    pub fn business_onboarding(&self, conn: &mut PgConn) -> ApiResult<Option<Onboarding>> {
        let Some(sb_id) = self.scoped_business_id() else {
            return Ok(None);
        };
        let identifier = OnboardingIdentifier::ScopedBusinessId {
            sb_id: &sb_id,
            vault_id: self.user_vault_id(),
        };
        let (ob, _, _, _) = Onboarding::get(conn, identifier)?;
        Ok(Some(ob))
    }

    /// Fetch the scoped_user info
    pub fn scoped_user(&self, conn: &mut PgConn) -> ApiResult<Option<ScopedVault>> {
        let Some(scoped_user_id) = self.scoped_user_id() else {
            return Ok(None);
        };

        // Confirm that the scoped_user in the auth token belongs to the user
        let scoped_user = ScopedVault::get(conn, (&scoped_user_id, &self.data.user_vault_id))?;
        Ok(Some(scoped_user))
    }

    /// Fetch the onboarding info associated with this user token, if it exists
    pub fn onboarding(&self, conn: &mut PgConn) -> ApiResult<Option<AuthedOnboardingInfo>> {
        if !UserAuthGuard::OrgOnboarding.is_met(&self.data.scopes) {
            // If there is no Onboarding scope on this auth token, the Onboarding won't exist
            return Ok(None);
        }

        let Some(scoped_user_id) = self.scoped_user_id() else {
            return Ok(None);
        };

        // Confirm that the onboarding in the auth token belongs to the user
        let (onboarding, scoped_user, _, _) =
            Onboarding::get(conn, (&scoped_user_id, &self.data.user_vault_id))?;
        // Confirm that the ob config is active
        let (ob_config, tenant) = ObConfiguration::get_enabled(conn, &onboarding.ob_configuration_id)?;
        let info = AuthedOnboardingInfo {
            user_vault_id: self.data.user_vault_id.clone(),
            onboarding,
            scoped_user,
            ob_config,
            tenant,
        };
        Ok(Some(info))
    }

    /// Assert that the onboarding info exists for this user auth token and return it.
    /// Useful as a shorthand for endpoints along the onboarding flow
    pub fn assert_onboarding(&self, conn: &mut PgConn) -> ApiResult<AuthedOnboardingInfo> {
        let info = self
            .onboarding(conn)?
            .ok_or_else(|| AuthError::MissingScope(vec![UserAuthGuard::OrgOnboarding].into()))?;
        Ok(info)
    }
}

impl UserAuth for UserSession {
    fn user_vault_id(&self) -> &VaultId {
        &self.user_vault_id
    }
}

/// Nests a private UserSession and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested UserSession is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested UserSession
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Security)]
#[serde(transparent)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fp-Authorization",
    description = "Auth token for user"
)]
pub struct ParsedUserSession(UserSession);

impl ExtractableAuthSession for ParsedUserSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_from(
        value: AuthSessionData,
        _: &mut PgConn,
        _: LaunchDarklyFeatureFlagClient,
    ) -> Result<Self, ApiError> {
        match value {
            AuthSessionData::User(data) => {
                tracing::info!(user_vault_id=%data.user_vault_id, "user session authenticated");
                Ok(ParsedUserSession(data))
            }
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }
}

/// A shorthand for the commonly used ParsedUserSession context
pub type UserAuthContext = SessionContext<ParsedUserSession>;

/// A shorthand for the commonly used UserSession context
pub type CheckedUserAuthContext = SessionContext<UserSession>;

impl UserAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_guard<T>(self, guard: T) -> Result<CheckedUserAuthContext, AuthError>
    where
        T: IsGuardMet<UserAuthScope>,
    {
        let requested_permission_str = format!("{}", guard);
        if guard.is_met(&self.data.0.scopes) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingUserPermission(requested_permission_str))
        }
    }
}
