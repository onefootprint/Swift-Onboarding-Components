use newtypes::{
    AuthEventId, AuthMethodKind, ContactInfoId, DataIdentifier, IdentifyScope, ObConfigurationId,
    ScopedVaultId, UserAuthScope, VaultId, WorkflowId, WorkflowRequestId,
};

use crate::errors::{user::UserError, ApiResult};

use super::AuthSessionData;

/// A user-specific auth session. Permissions for the session are defined by the set of scopes.
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
// WARNING: changing this could break existing user auth sessions
pub struct UserSession {
    pub user_vault_id: VaultId,
    /// Context on the purpose for which this user session was created.
    /// If a session is created by stepping up an old sesion, we'll keep the old purpose
    pub purpose: UserSessionPurpose,
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
    /// The auth events that give this token its permissions
    #[serde(default)]
    pub auth_events: Vec<AssociatedAuthEvent>,
    /// When true, the auth events that occurred at this tenant were inherited to form this token,
    /// rather than proof of auth being exchanged physically
    /// rm?
    #[serde(default)]
    #[allow(unused)]
    pub is_implied_auth: bool,
    /// The list of DataIdentifiers whose knowledge has been proven during this session
    #[serde(default)]
    pub kba: Vec<DataIdentifier>,
}

#[derive(Default)]
/// The nullable options in UserSession
pub struct NewUserSessionContext {
    pub su_id: Option<ScopedVaultId>,
    pub sb_id: Option<ScopedVaultId>,
    pub obc_id: Option<ObConfigurationId>,
    pub wf_id: Option<WorkflowId>,
    pub wfr_id: Option<WorkflowRequestId>,
    pub is_implied_auth: bool,
    pub kba: Vec<DataIdentifier>,
}

/// Enumerate all the possible places in which a user auth token can be created.
/// This is essentially a union of IdentifyScope and UserTokenKind
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum UserSessionPurpose {
    Auth,
    Bifrost,
    My1fp,
    ApiOnboard,
    ApiReonboard,
    ApiInherit,
    ApiUser,
    ApiUpdateAuthMethods {
        limit_auth_methods: Option<Vec<AuthMethodKind>>,
    },
}

impl From<IdentifyScope> for UserSessionPurpose {
    fn from(value: IdentifyScope) -> Self {
        match value {
            IdentifyScope::Auth => Self::Auth,
            IdentifyScope::My1fp => Self::My1fp,
            IdentifyScope::Onboarding => Self::Bifrost,
        }
    }
}

impl UserSessionPurpose {
    /// When true, the purpose was created via API rather than via a hosted Footprint flow.
    pub fn is_from_api(&self) -> bool {
        match self {
            Self::ApiOnboard
            | Self::ApiReonboard
            | Self::ApiInherit
            | Self::ApiUser
            | Self::ApiUpdateAuthMethods { .. } => true,
            Self::Bifrost | Self::Auth | Self::My1fp => false,
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct AssociatedAuthEvent {
    pub id: AuthEventId,
    pub kind: AssociatedAuthEventKind,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Copy, PartialEq, Eq)]
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

pub struct NewUserSessionArgs {
    pub user_vault_id: VaultId,
    pub context: NewUserSessionContext,
    pub purpose: UserSessionPurpose,
    pub scopes: Vec<UserAuthScope>,
    pub auth_events: Vec<AssociatedAuthEvent>,
}

impl UserSession {
    pub fn make(args: NewUserSessionArgs) -> ApiResult<AuthSessionData> {
        let NewUserSessionArgs {
            user_vault_id,
            context,
            purpose,
            scopes,
            auth_events,
        } = args;
        if scopes.iter().any(|s| matches!(s, UserAuthScope::SignUp)) && context.su_id.is_none() {
            return Err(UserError::InvalidAuthSession(
                "Cannot create session with SignUp scope without su_id".into(),
            )
            .into());
        }
        let NewUserSessionContext {
            su_id,
            sb_id,
            obc_id,
            wf_id,
            wfr_id,
            is_implied_auth,
            kba,
        } = context;
        let session = AuthSessionData::User(Self {
            user_vault_id,
            purpose,
            su_id,
            sb_id,
            obc_id,
            wf_id,
            wfr_id,
            scopes,
            auth_events,
            is_implied_auth,
            kba,
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
