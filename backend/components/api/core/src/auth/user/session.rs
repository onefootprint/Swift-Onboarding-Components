use std::{collections::HashMap, sync::Arc};

use db::{
    models::{
        auth_event::AuthEvent, ob_configuration::ObConfiguration, scoped_vault::ScopedVault, tenant::Tenant,
        vault::Vault,
    },
    PgConn,
};
use itertools::Itertools;
use newtypes::{
    AuthEventKind, DataIdentifier, ObConfigurationId, ScopedVaultId, VaultId, VaultKind, WorkflowId,
    WorkflowRequestId,
};
use paperclip::actix::Apiv2Security;

use crate::{
    auth::{
        session::{
            user::{
                AssociatedAuthEvent, AssociatedAuthEventKind, NewUserSessionArgs, NewUserSessionContext,
                UserSession, UserSessionPurpose,
            },
            AllowSessionUpdate, AuthSessionData, ExtractableAuthSession, RequestInfo,
        },
        user::UserAuth,
        AuthError, IsGuardMet, SessionContext,
    },
    errors::{ApiError, ApiResult},
};
use feature_flag::FeatureFlagClient;
use newtypes::UserAuthScope;

#[derive(Debug, Clone)]
pub struct UserSessionContext {
    pub user: Vault,
    pub scopes: Vec<UserAuthScope>,
    pub purpose: UserSessionPurpose,
    pub(super) obc: Option<ObConfiguration>,
    pub(super) tenant: Option<Tenant>,
    pub(super) scoped_user: Option<ScopedVault>,
    pub(super) sb_id: Option<ScopedVaultId>,
    pub(super) obc_id: Option<ObConfigurationId>,
    pub(super) wf_id: Option<WorkflowId>,
    pub wfr_id: Option<WorkflowRequestId>,
    pub(super) is_implied_auth: bool,
    pub auth_events: Vec<AssociatedAuthEvent>,
    pub kba: Vec<DataIdentifier>,
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

// Allow calling SessionContext<T>::update for T=UserSessionContext
impl AllowSessionUpdate for UserSessionContext {}

impl UserSessionContext {
    pub fn update(
        self,
        new_ctx: NewUserSessionContext,
        new_scopes: Vec<UserAuthScope>,
        new_auth_event: Option<AssociatedAuthEvent>,
    ) -> ApiResult<AuthSessionData> {
        // Merge context, scopes, and auth factors and create a new session with these merged fields
        let context = NewUserSessionContext {
            su_id: new_ctx.su_id.or(self.scoped_user.map(|su| su.id)),
            sb_id: new_ctx.sb_id.or(self.sb_id),
            obc_id: new_ctx.obc_id.or(self.obc_id),
            wf_id: new_ctx.wf_id.or(self.wf_id),
            wfr_id: new_ctx.wfr_id.or(self.wfr_id),
            is_implied_auth: new_ctx.is_implied_auth || self.is_implied_auth,
            kba: new_ctx.kba.into_iter().chain(self.kba).unique().collect(),
        };
        let scopes = self.scopes.into_iter().chain(new_scopes).unique().collect();
        let auth_events = self.auth_events.into_iter().chain(new_auth_event).collect();
        let args = NewUserSessionArgs {
            user_vault_id: self.user.id,
            purpose: self.purpose,
            context,
            scopes,
            auth_events,
        };
        UserSession::make(args)
    }

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
    ) -> Result<Self, ApiError> {
        match value {
            AuthSessionData::User(data) => {
                let UserSession {
                    user_vault_id,
                    purpose,
                    su_id,
                    sb_id,
                    wf_id,
                    wfr_id,
                    obc_id,
                    scopes,
                    auth_events,
                    is_implied_auth,
                    kba,
                } = data;
                let vault = Vault::get(conn, &user_vault_id)?;
                if vault.kind != VaultKind::Person {
                    return Err(AuthError::NonPersonVault.into());
                }
                let scoped_user = su_id
                    .as_ref()
                    // Conservatively confirm that the onboarding in the auth token belongs to the user
                    .map(|id| ScopedVault::get(conn, (id, &vault.id)))
                    .transpose()?;
                let (obc, _) = obc_id
                    .as_ref()
                    .map(|id| ObConfiguration::get(conn, id))
                    .transpose()?
                    .unzip();
                let tenant = scoped_user
                    .as_ref()
                    .map(|sv| Tenant::get(conn, &sv.tenant_id))
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

                let data = UserSessionContext {
                    user: vault,
                    purpose,
                    sb_id,
                    wf_id,
                    wfr_id,
                    scoped_user,
                    obc,
                    tenant,
                    obc_id,
                    scopes,
                    auth_events,
                    is_implied_auth,
                    kba,
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
