use super::{UserAuth, UserAuthGuard};
use db::{
    models::{
        ob_configuration::ObConfiguration,
        onboarding::{Onboarding, OnboardingIdentifier},
        scoped_vault::ScopedVault,
        tenant::Tenant,
    },
    PgConn,
};
use feature_flag::LaunchDarklyFeatureFlagClient;
use newtypes::{ScopedVaultId, VaultId};
use paperclip::actix::Apiv2Security;

use crate::{
    auth::{
        session::{AuthSessionData, ExtractableAuthSession},
        AuthError, IsGuardMet, SessionContext,
    },
    errors::ApiResult,
    ApiError,
};

use super::{ParsedUserSession, UserAuthScope, UserSession};

/// A wrapper around UserSession that can only be extracted when the auth token is for an active
/// onboarding session.
/// We preload information for the onboarding that is commonly used by HTTP handlers
#[derive(Debug, Clone)]
pub struct UserObSession {
    user_session: UserSession,
    pub onboarding: Onboarding,
    pub scoped_user: ScopedVault,
    pub ob_config: ObConfiguration,
    pub tenant: Tenant,
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fp-Authorization",
    description = "Auth token for user"
)]
pub struct ParsedUserObSession(UserObSession);

impl ExtractableAuthSession for ParsedUserObSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        value: AuthSessionData,
        conn: &mut PgConn,
        ff_client: LaunchDarklyFeatureFlagClient,
    ) -> Result<Self, ApiError> {
        // Since this is derived from a user session, we just grab all the user info
        let user_session =
            <ParsedUserSession as ExtractableAuthSession>::try_load_session(value, conn, ff_client)?.0;

        let Some(scoped_user_id) = user_session.scoped_user_id() else {
            return Err(AuthError::MissingScope(vec![UserAuthGuard::OrgOnboardingInit].into()))?;
        };

        // Confirm that the onboarding in the auth token belongs to the user
        let (onboarding, scoped_user, _, _) =
            Onboarding::get(conn, (&scoped_user_id, &user_session.user_vault_id))?;
        // Confirm that the ob config is active
        let (ob_config, tenant) = ObConfiguration::get_enabled(conn, &onboarding.ob_configuration_id)?;
        let onboarding_session = UserObSession {
            user_session,
            onboarding,
            scoped_user,
            ob_config,
            tenant,
        };
        Ok(ParsedUserObSession(onboarding_session))
    }
}

/// A shorthand for the commonly used ParsedUserSession context
pub type UserObAuthContext = SessionContext<ParsedUserObSession>;

/// A shorthand for the commonly used UserSession context
pub type CheckedUserObAuthContext = SessionContext<UserObSession>;

impl UserObAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_guard<T>(self, guard: T) -> Result<CheckedUserObAuthContext, AuthError>
    where
        T: IsGuardMet<UserAuthScope>,
    {
        let requested_permission_str = format!("{}", guard);
        if guard.is_met(&self.0.user_session.scopes) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingUserPermission(requested_permission_str))
        }
    }
}

impl CheckedUserObAuthContext {
    /// Extracts the business vault_id from the `UserAuthScope::Business` scope on this session, if
    /// exists
    pub fn scoped_business_id(&self) -> Option<ScopedVaultId> {
        self.user_session
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
}

impl UserAuth for UserObSession {
    fn user_vault_id(&self) -> &VaultId {
        &self.user_session.user_vault_id
    }
}
