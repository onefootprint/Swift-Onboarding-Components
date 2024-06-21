use crate::auth::session::user::AssociatedAuthEvent;
use crate::auth::session::user::AssociatedAuthEventKind;
use crate::auth::session::user::UserSession;
use crate::auth::session::AllowSessionUpdate;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::user::UserAuth;
use crate::auth::AuthError;
use crate::auth::IsGuardMet;
use crate::auth::SessionContext;
use crate::errors::ApiResult;
use crate::utils::session::AuthSession;
use chrono::DateTime;
use chrono::Duration;
use chrono::Utc;
use crypto::aead::ScopedSealingKey;
use db::models::auth_event::AuthEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use itertools::Itertools;
use newtypes::AuthEventKind;
use newtypes::ObConfigurationId;
use newtypes::ScopedVaultId;
use newtypes::SessionAuthToken;
use newtypes::UserAuthScope;
use newtypes::VaultId;
use newtypes::VaultKind;
use newtypes::WorkflowId;
use paperclip::actix::Apiv2Security;
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Debug, Clone, derive_more::Deref)]
pub struct UserSessionContext {
    pub user: Vault,
    pub(super) obc: Option<ObConfiguration>,
    pub(super) tenant: Option<Tenant>,
    pub(super) scoped_user: Option<ScopedVault>,
    #[deref]
    /// The underlying session data that's stored in the database
    pub session: UserSession,
}

impl UserSessionContext {
    pub fn did_use_passkey(&self, conn: &mut PgConn) -> ApiResult<bool> {
        let aes = load_auth_events(conn, &self.auth_events)?;
        Ok(aes.iter().any(|(ae, _)| ae.kind == AuthEventKind::Passkey))
    }
}

pub fn load_auth_events(
    conn: &mut PgConn,
    auth_events: &[AssociatedAuthEvent],
) -> ApiResult<Vec<(AuthEvent, AssociatedAuthEventKind)>> {
    let id_to_kind: HashMap<_, _> = auth_events.iter().map(|e| (e.id.clone(), e.kind)).collect();
    let ids = id_to_kind.keys().cloned().collect_vec();
    let aes = AuthEvent::get_bulk(conn, &ids)?;
    let aes = aes
        .into_iter()
        .filter_map(|ae| id_to_kind.get(&ae.id).map(|k| (ae, *k)))
        .collect();
    Ok(aes)
}

impl UserAuth for UserSessionContext {
    fn user_vault_id(&self) -> &VaultId {
        &self.user.id
    }
}

// Allow calling SessionContext<UserSessionContext>::update
// TODO this is now the only place where we mutate sessions. Probably want to get rid of it
impl AllowSessionUpdate for SessionContext<UserSessionContext> {}

impl UserSessionContext {
    pub fn scoped_user_id(&self) -> Option<ScopedVaultId> {
        self.scoped_user.as_ref().map(|su| su.id.clone())
    }

    pub fn scoped_user(&self) -> Option<&ScopedVault> {
        self.scoped_user.as_ref()
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
        self.obc.as_ref()
    }

    pub fn tenant(&self) -> Option<&Tenant> {
        self.tenant.as_ref()
    }

    /// Returns the most specific identifier for this auth session - either the sv_id or v_id
    pub fn user_identifier(&self) -> UserIdentifier {
        if let Some(sv_id) = self.scoped_user_id() {
            UserIdentifier::ScopedVault(sv_id)
        } else {
            UserIdentifier::Vault(self.user_vault_id().clone())
        }
    }
}

pub enum UserIdentifier {
    Vault(VaultId),
    ScopedVault(ScopedVaultId),
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
    ) -> ApiResult<Self> {
        match value {
            AuthSessionData::User(data) => {
                let vault = Vault::get(conn, &data.user_vault_id)?;
                if vault.kind != VaultKind::Person {
                    return Err(AuthError::NonPersonVault.into());
                }
                let scoped_user = data.su_id
                    .as_ref()
                    // Conservatively confirm that the onboarding in the auth token belongs to the user
                    .map(|id| ScopedVault::get(conn, (id, &vault.id)))
                    .transpose()?;
                let (obc, tenant) = data
                    .obc_id
                    .as_ref()
                    .map(|id| ObConfiguration::get(conn, id))
                    .transpose()?
                    .unzip();
                let tenant = scoped_user
                    .as_ref()
                    .map(|sv| Tenant::get(conn, &sv.tenant_id))
                    .transpose()?
                    .or(tenant);

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

                let data = UserSessionContext {
                    user: vault,
                    scoped_user,
                    obc,
                    tenant,
                    session: data,
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
        root_span.record("auth_method", "user_session");
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

impl CheckedUserAuthContext {
    /// Creates a new auth token with an expiry derived off of the current auth token.
    /// This function guarantees that we won't create a derived token that expires after the source
    /// token.
    pub fn create_derived(
        &self,
        conn: &mut db::PgConn,
        session_key: &ScopedSealingKey,
        session: AuthSessionData,
        max_duration: Option<Duration>,
    ) -> ApiResult<(SessionAuthToken, DateTime<Utc>)> {
        let current_expires_at = self.expires_at();
        let expires_at = if let Some(duration) = max_duration {
            current_expires_at.min(Utc::now() + duration)
        } else {
            current_expires_at
        };
        let (token, session) = AuthSession::create_sync(conn, session_key, session, expires_at)?;
        Ok((token, session.expires_at))
    }
}
