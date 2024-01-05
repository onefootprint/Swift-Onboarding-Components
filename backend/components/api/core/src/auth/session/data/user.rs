use newtypes::AuthEventId;
use newtypes::ContactInfoId;
use newtypes::ObConfigurationId;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::WorkflowId;
use newtypes::WorkflowRequestId;

use crate::auth::user::UserAuthScope;
use crate::errors::user::UserError;
use crate::errors::ApiResult;

use super::AuthSessionData;

/// A user-specific auth session. Permissions for the session are defined by the set of scopes.
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
// WARNING: changing this could break existing user auth sessions
pub struct UserSession {
    pub user_vault_id: VaultId,
    /// The tenant-scoped user for the auth session. Only null for my1fp
    pub su_id: Option<ScopedVaultId>,
    /// The scoped business for the auth session, if any
    pub sb_id: Option<ScopedVaultId>,
    /// The obc that we'll use to make a new onboarding workflow, if any
    pub obc_id: Option<ObConfigurationId>,
    /// The workflow for the auth session, if any
    pub wf_id: Option<WorkflowId>,
    /// The workflow request for the auth session, if any. This provides only-once semantics for
    /// the auth token - we don't allow making a new Workflow if you've already made one
    pub wfr_id: Option<WorkflowRequestId>,
    /// Permissions that this auth token is given
    pub scopes: Vec<UserAuthScope>,
    /// DEPRECATED
    #[serde(default)]
    pub auth_event_ids: Vec<AuthEventId>,
    /// The auth events that give this token its permissions
    #[serde(default)]
    pub auth_events: Vec<AssociatedAuthEvent>,
    /// When true, the auth token was initially issued as an unauthed, identified token.
    /// Also true for tokens created via step up of tokens made via API
    pub is_from_api: bool,
    /// When true, the auth events that occurred at this tenant were inherited to form this token,
    /// rather than proof of auth being exchanged physically
    #[serde(default)]
    #[allow(unused)]
    pub is_implied_auth: bool,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct AssociatedAuthEvent {
    pub id: AuthEventId,
    pub kind: AssociatedAuthEventKind,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub enum AssociatedAuthEventKind {
    /// The auth event was created explicitly by the user using this auth session.
    Explicit,
    /// The auth event was implicitly inherited when creating a token via tenant-facing API.
    /// Implicit auths have fewer permissions that explicit auths
    Implicit,
}

impl AssociatedAuthEvent {
    pub fn implicit(id: AuthEventId) -> Self {
        Self {
            id,
            kind: AssociatedAuthEventKind::Implicit,
        }
    }

    pub fn explicit(id: AuthEventId) -> Self {
        Self {
            id,
            kind: AssociatedAuthEventKind::Explicit,
        }
    }
}

#[derive(Default)]
pub struct UserSessionArgs {
    pub su_id: Option<ScopedVaultId>,
    pub sb_id: Option<ScopedVaultId>,
    pub obc_id: Option<ObConfigurationId>,
    pub wf_id: Option<WorkflowId>,
    pub wfr_id: Option<WorkflowRequestId>,
    pub is_from_api: bool,
    pub is_implied_auth: bool,
}

impl UserSession {
    pub fn make(
        user_vault_id: VaultId,
        args: UserSessionArgs,
        scopes: Vec<UserAuthScope>,
        // TODO rm
        auth_event_ids: Vec<AuthEventId>,
        auth_events: Vec<AssociatedAuthEvent>,
    ) -> ApiResult<AuthSessionData> {
        if scopes.iter().any(|s| matches!(s, UserAuthScope::SignUp)) && args.su_id.is_none() {
            return Err(UserError::InvalidAuthSession(
                "Cannot create session with SignUp scope without su_id".into(),
            )
            .into());
        }
        let UserSessionArgs {
            su_id,
            sb_id,
            obc_id,
            wf_id,
            wfr_id,
            is_from_api,
            is_implied_auth,
        } = args;
        let session = AuthSessionData::User(Self {
            user_vault_id,
            su_id,
            sb_id,
            obc_id,
            wf_id,
            wfr_id,
            scopes,
            is_from_api,
            auth_event_ids,
            auth_events,
            is_implied_auth,
        });
        Ok(session)
    }
}

/// Short-lived token that represents the completion of an onboarding
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ValidateUserToken {
    pub wf_id: Option<WorkflowId>,
    pub auth_event_ids: Vec<AuthEventId>,
    pub sv_id: ScopedVaultId,
}

/// Longer-lived session that is sent out in emails to verify ownership
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifySession {
    // May contain old primary keys to Email rows (legacy) or primary keys to ContactInfo rows (modern)
    pub email_id: ContactInfoId,
}
