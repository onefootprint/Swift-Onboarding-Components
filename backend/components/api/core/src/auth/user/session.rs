use std::sync::Arc;

use db::{
    models::{
        auth_event::AuthEvent, ob_configuration::ObConfiguration, scoped_vault::ScopedVault, tenant::Tenant,
        vault::Vault,
    },
    PgConn,
};
use itertools::Itertools;
use newtypes::{
    AuthEventId, AuthEventKind, ObConfigurationId, ScopedVaultId, VaultId, VaultKind, WorkflowId,
};
use paperclip::actix::Apiv2Security;

use super::UserAuthScope;
use crate::{
    auth::{
        session::{
            user::{UserSession, UserSessionArgs},
            AllowSessionUpdate, AuthSessionData, ExtractableAuthSession, RequestInfo,
        },
        user::UserAuth,
        AuthError, IsGuardMet, SessionContext,
    },
    errors::{ApiError, ApiResult},
};
use feature_flag::FeatureFlagClient;

#[derive(Debug, Clone)]
pub struct UserSessionContext {
    pub user: Vault,
    pub scopes: Vec<UserAuthScope>,
    pub(super) obc: Option<(ObConfiguration, Tenant)>,
    pub(super) scoped_user: Option<ScopedVault>,
    pub(super) sb_id: Option<ScopedVaultId>,
    pub(super) obc_id: Option<ObConfigurationId>,
    pub(super) wf_id: Option<WorkflowId>,
    pub(super) is_implied_auth: bool,
    pub auth_event_ids: Vec<AuthEventId>,
    /// When true, the auth token was initially issued as an unauthed, identified token
    pub is_from_api: bool,
}

impl UserSessionContext {
    pub fn did_use_passkey(&self, conn: &mut PgConn) -> ApiResult<bool> {
        let aes = self.auth_events(conn)?;
        Ok(aes.iter().any(|ae| ae.kind == AuthEventKind::Passkey))
    }

    pub fn auth_events(&self, conn: &mut PgConn) -> ApiResult<Vec<AuthEvent>> {
        let aes = AuthEvent::get_bulk(conn, &self.auth_event_ids)?;
        Ok(aes)
    }
}

impl UserAuth for UserSessionContext {
    fn user_vault_id(&self) -> &VaultId {
        &self.user.id
    }
}

// Allow calling SessionContext<T>::update for T=UserSessionContext
impl AllowSessionUpdate for UserSessionContext {}

impl UserSessionContext {
    pub fn update(
        self,
        new_args: UserSessionArgs,
        new_scopes: Vec<UserAuthScope>,
        new_auth_event_id: Option<AuthEventId>,
    ) -> ApiResult<AuthSessionData> {
        // Merge args, scopes, and auth factors and create a new session with these merged fields
        let new_scopes = self.scopes.into_iter().chain(new_scopes).unique().collect();

        let args = UserSessionArgs {
            su_id: new_args.su_id.or(self.scoped_user.map(|su| su.id)),
            sb_id: new_args.sb_id.or(self.sb_id),
            obc_id: new_args.obc_id.or(self.obc_id),
            wf_id: new_args.wf_id.or(self.wf_id),
            is_from_api: new_args.is_from_api || self.is_from_api,
            is_implied_auth: new_args.is_implied_auth || self.is_implied_auth,
        };
        let ae_ids = self.auth_event_ids.into_iter().chain(new_auth_event_id).collect();
        UserSession::make(self.user.id, args, new_scopes, ae_ids)
    }

    pub fn scoped_user_id(&self) -> Option<ScopedVaultId> {
        self.scoped_user.as_ref().map(|su| su.id.clone())
    }

    pub fn ob_configuration_id(&self) -> Option<ObConfigurationId> {
        self.obc_id.clone()
    }

    pub fn workflow_id(&self) -> Option<WorkflowId> {
        self.wf_id.clone()
    }

    pub fn scoped_business_id(&self) -> Option<ScopedVaultId> {
        self.sb_id.clone()
    }

    pub fn ob_config(&self) -> Option<&ObConfiguration> {
        self.obc.as_ref().map(|(obc, _)| obc)
    }

    pub fn tenant(&self) -> Option<&Tenant> {
        self.obc.as_ref().map(|(_, t)| t)
    }
}

/// Nests a private UserSession and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested UserSession is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested UserSession
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "User Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions."
)]
pub struct ParsedUserSessionContext(pub(super) UserSessionContext);

impl ExtractableAuthSession for ParsedUserSessionContext {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        value: AuthSessionData,
        conn: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
        req: RequestInfo,
    ) -> Result<Self, ApiError> {
        match value {
            AuthSessionData::User(data) => {
                let UserSession {
                    user_vault_id,
                    su_id,
                    sb_id,
                    wf_id,
                    obc_id,
                    scopes,
                    is_from_api,
                    auth_event_id,
                    auth_event_ids,
                    is_implied_auth,
                } = data;
                let vault = Vault::get(conn, &user_vault_id)?;
                if vault.kind != VaultKind::Person {
                    return Err(AuthError::NonPersonVault.into());
                }
                tracing::info!(user_vault_id=%user_vault_id, "user session authenticated");
                let scoped_user = su_id
                    .as_ref()
                    // Conservatively confirm that the onboarding in the auth token belongs to the user
                    .map(|id| ScopedVault::get(conn, (id, &vault.id)))
                    .transpose()?;
                let obc = obc_id
                    .as_ref()
                    .map(|id| ObConfiguration::get(conn, id))
                    .transpose()?;

                if let Some(su) = scoped_user.as_ref() {
                    // Every few minutes, set the heartbeat when a user auth session authenticates
                    // as this scoped user. This allows us to track when users are still
                    // in progress and the last time we've seen the user
                    if !req.method.is_safe() {
                        // Only do this in non-read-only API requests so we don't have unintended
                        // side effects in HTTP GET/OPTIONS/TRACE/HEAD requests
                        su.set_heartbeat(conn)?;
                    }
                }

                // Merge auth event ids for backcompat for now
                let auth_event_ids = auth_event_ids.into_iter().chain(auth_event_id).unique().collect();
                let data = UserSessionContext {
                    user: vault,
                    sb_id,
                    wf_id,
                    scoped_user,
                    obc,
                    obc_id,
                    scopes,
                    is_from_api,
                    auth_event_ids,
                    is_implied_auth,
                };
                Ok(ParsedUserSessionContext(data))
            }
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("vault_id", &self.0.user.id.to_string());
        if let Some(su) = self.0.scoped_user.as_ref() {
            root_span.record("tenant_id", su.tenant_id.to_string());
            root_span.record("fp_id", su.fp_id.to_string());
            root_span.record("is_live", su.is_live);
        }
    }
}

/// A shorthand for the commonly used ParsedUserSessionContext context
pub type UserAuthContext = SessionContext<ParsedUserSessionContext>;

/// A shorthand for the commonly used UserSession context
pub type CheckedUserAuthContext = SessionContext<UserSessionContext>;

impl UserAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_guard<T>(self, guard: T) -> Result<CheckedUserAuthContext, AuthError>
    where
        T: IsGuardMet<UserAuthScope>,
    {
        let requested_permission_str = format!("{}", guard);
        if guard.is_met(&self.0.scopes) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingUserPermission(requested_permission_str))
        }
    }
}
