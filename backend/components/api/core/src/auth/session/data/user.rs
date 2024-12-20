use super::onboarding::OnboardingSessionTrustedMetadata;
use super::AuthSessionData;
use crate::errors::user::UserError;
use crate::FpResult;
use api_errors::BadRequestInto;
use itertools::chain;
use itertools::Itertools;
use newtypes::AuthEventId;
use newtypes::AuthMethodKind;
use newtypes::BoId;
use newtypes::ContactInfoId;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSource;
use newtypes::IdentifyScope;
use newtypes::InsightEventId;
use newtypes::ObConfigurationId;
use newtypes::RequestedTokenScope;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::UserAuthScope;
use newtypes::VaultId;
use newtypes::WorkflowId;
use newtypes::WorkflowRequestId;

/// A user-specific auth session. Permissions for the session are defined by the set of scopes.
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
// WARNING: changing this could break existing user auth sessions
pub struct UserSession {
    pub user_vault_id: VaultId,
    /// The list of creation reasons throughout the history of this session.
    /// Since one auth token can be used to create another, we append the creation purpose to this
    /// list every time we make a new token. So, this list will show the whole history of why
    /// tokens were created
    pub purposes: Vec<TokenCreationPurpose>,
    /// The tenant-scoped user for the auth session. Only null for my1fp
    pub su_id: Option<ScopedVaultId>,
    /// The scoped business for the auth session, if any
    pub sb_id: Option<ScopedVaultId>,
    /// The business owner ID if we are in the process of conducting KYC for a business owner.
    /// This is only ever used for multi-KYC links for specific BOs.
    pub bo_id: Option<BoId>,
    /// The obc that we'll use to make a new onboarding workflow, if any
    pub obc_id: Option<ObConfigurationId>,
    /// The workflow for the user in this auth session, if any
    pub wf_id: Option<WorkflowId>,
    /// The workflow for the business in this auth session, if any
    #[serde(default)]
    pub biz_wf_id: Option<WorkflowId>,
    /// The workflow request for the auth session, if any. This provides only-once semantics for
    /// the auth token - we don't allow making a new Workflow if you've already made one
    pub wfr_id: Option<WorkflowRequestId>,
    /// Permissions that this auth token is given
    pub scopes: Vec<UserAuthScope>,
    /// The auth events that give this token its permissions
    #[serde(default)]
    pub auth_events: Vec<AssociatedAuthEvent>,
    /// The list of DataIdentifiers whose knowledge has been proven during this session
    #[serde(default)]
    pub kba: Vec<DataIdentifier>,
    #[serde(default)]
    pub metadata: OnboardingSessionTrustedMetadata,
    /// For an identify session token, the requested scope
    pub identify_scope: Option<IdentifyScope>,
}

#[derive(Default)]
/// The nullable options in UserSession
/// TODO: could probably rm this in favor of the .with_xxx() builder semantics
pub struct NewUserSessionContext {
    pub su_id: Option<ScopedVaultId>,
    pub sb_id: Option<ScopedVaultId>,
    pub bo_id: Option<BoId>,
    pub obc_id: Option<ObConfigurationId>,
    pub wf_id: Option<WorkflowId>,
    pub biz_wf_id: Option<WorkflowId>,
    pub wfr_id: Option<WorkflowRequestId>,
    pub kba: Vec<DataIdentifier>,
    pub metadata: Option<OnboardingSessionTrustedMetadata>,
    pub identify_scope: Option<IdentifyScope>,
}

/// Enumerate all the possible places in which a user auth token can be created.
/// This is essentially a union of IdentifyScope and UserTokenKind
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum TokenCreationPurpose {
    Auth,
    Bifrost,
    My1fp,
    /// This token was created for the bifrost Components SDK and should have limited scope
    BifrostComponentsSdk,
    /// This token was created as a handoff token
    Handoff,
    /// This token was created after adding a Kba response
    Kba,
    /// This token was created after adding a workflow
    AddWorkflow,
    /// New login method created in POST /hosted/user/challenge/verify
    RegisterAuthMethod,
    /// Created for an identify session
    IdentifySession,
    /// Created after verifying a challenge in an identify session
    IdentifySessionChallengeVerify,
    /// This token was created to onboard a secondary BO in a multi-KYC playbook
    SecondaryBo,
    ApiOnboard,
    ApiReonboard,
    ApiInherit,
    ApiUser,
    ApiUpdateAuthMethods {
        limit_auth_methods: Option<Vec<AuthMethodKind>>,
    },
}

impl From<IdentifyScope> for TokenCreationPurpose {
    fn from(value: IdentifyScope) -> Self {
        RequestedTokenScope::from(value).into()
    }
}

impl From<RequestedTokenScope> for TokenCreationPurpose {
    fn from(value: RequestedTokenScope) -> Self {
        match value {
            RequestedTokenScope::Auth => Self::Auth,
            RequestedTokenScope::My1fp => Self::My1fp,
            RequestedTokenScope::Onboarding => Self::Bifrost,
            RequestedTokenScope::OnboardingComponents => Self::BifrostComponentsSdk,
        }
    }
}

impl TokenCreationPurpose {
    /// When true, the purpose was created via API rather than via a hosted Footprint flow.
    pub fn is_from_api(&self) -> bool {
        match self {
            Self::ApiOnboard
            | Self::ApiReonboard
            | Self::ApiInherit
            | Self::ApiUser
            | Self::ApiUpdateAuthMethods { .. } => true,
            Self::Bifrost
            | Self::Auth
            | Self::My1fp
            | Self::BifrostComponentsSdk
            | Self::Handoff
            | Self::AddWorkflow
            | Self::RegisterAuthMethod
            | Self::SecondaryBo
            | Self::IdentifySession
            | Self::IdentifySessionChallengeVerify
            | Self::Kba => false,
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

pub struct UserSessionBuilder {
    pub user_vault_id: VaultId,
    pub context: NewUserSessionContext,
    pub purposes: Vec<TokenCreationPurpose>,
    pub scopes: Vec<UserAuthScope>,
    pub auth_events: Vec<AssociatedAuthEvent>,
}

impl UserSessionBuilder {
    pub fn new(user_vault_id: VaultId, purposes: Vec<TokenCreationPurpose>) -> Self {
        Self {
            user_vault_id,
            purposes,
            scopes: vec![],
            auth_events: vec![],
            context: NewUserSessionContext::default(),
        }
    }

    /// Given an existing UserSession, creates a new UserSessionBuilder with all context derived
    /// from the existing session.
    pub fn from_existing(
        session: &UserSession,
        purpose: TokenCreationPurpose,
    ) -> FpResult<UserSessionBuilder> {
        session.validate_not_derived_from_components()?;
        let context = NewUserSessionContext {
            metadata: Some(session.metadata.clone()),
            su_id: session.su_id.clone(),
            sb_id: session.sb_id.clone(),
            bo_id: session.bo_id.clone(),
            obc_id: session.obc_id.clone(),
            wf_id: session.wf_id.clone(),
            biz_wf_id: session.biz_wf_id.clone(),
            wfr_id: session.wfr_id.clone(),
            kba: session.kba.clone(),
            identify_scope: session.identify_scope,
        };
        let args = UserSessionBuilder {
            user_vault_id: session.user_vault_id.clone(),
            purposes: chain!(session.purposes.clone(), vec![purpose]).collect(),
            context,
            scopes: session.scopes.clone(),
            auth_events: session.auth_events.clone(),
        };
        Ok(args)
    }

    pub fn finish(self) -> FpResult<AuthSessionData> {
        let Self {
            user_vault_id,
            context,
            purposes,
            scopes,
            auth_events,
        } = self;
        if scopes.iter().any(|s| matches!(s, UserAuthScope::SignUp)) && context.su_id.is_none() {
            return Err(UserError::InvalidAuthSession(
                "Cannot create session with SignUp scope without su_id".into(),
            )
            .into());
        }
        let NewUserSessionContext {
            su_id,
            sb_id,
            bo_id,
            obc_id,
            wf_id,
            biz_wf_id,
            wfr_id,
            kba,
            metadata,
            identify_scope,
        } = context;
        let metadata = metadata.unwrap_or_default();
        let session = AuthSessionData::User(UserSession {
            user_vault_id,
            purposes,
            su_id,
            sb_id,
            bo_id,
            obc_id,
            wf_id,
            biz_wf_id,
            wfr_id,
            scopes,
            auth_events,
            kba,
            metadata,
            identify_scope,
        });
        Ok(session)
    }

    pub fn add_auth_events(self, new_auth_events: Vec<AssociatedAuthEvent>) -> Self {
        Self {
            auth_events: chain!(self.auth_events.clone(), new_auth_events).collect(),
            ..self
        }
    }

    pub fn add_scopes(self, new_scopes: Vec<UserAuthScope>) -> Self {
        Self {
            scopes: chain!(self.scopes.clone(), new_scopes).collect(),
            ..self
        }
    }

    pub fn replace_scopes(self, new_scopes: Vec<UserAuthScope>) -> FpResult<Self> {
        if new_scopes.iter().any(|s| !self.scopes.contains(s)) {
            // The only use case of this today is to request a token with _fewer_ scopes.
            // It could be dangerous to allow a user to request a token with _more_ scopes,
            // particularly for tokens given to the components SDK that intentially have
            // fewer scopes than their auth methods allow.
            // Do not remove this validation unless you know what you're doing.
            return BadRequestInto("Cannot use reduce_scopes to add additional scopes");
        }
        Ok(Self {
            scopes: new_scopes,
            ..self
        })
    }

    // TODO: use smaller methods for updating pieces of the context
    pub fn with_context(self, new_ctx: NewUserSessionContext) -> Self {
        let old = self.context;
        let context = NewUserSessionContext {
            metadata: new_ctx.metadata.or(old.metadata),
            su_id: new_ctx.su_id.or(old.su_id),
            sb_id: new_ctx.sb_id.or(old.sb_id),
            bo_id: new_ctx.bo_id.or(old.bo_id),
            obc_id: new_ctx.obc_id.or(old.obc_id),
            wf_id: new_ctx.wf_id.or(old.wf_id),
            biz_wf_id: new_ctx.biz_wf_id.or(old.biz_wf_id),
            wfr_id: new_ctx.wfr_id.or(old.wfr_id),
            kba: new_ctx.kba.into_iter().chain(old.kba).unique().collect(),
            identify_scope: new_ctx.identify_scope.or(old.identify_scope),
        };
        Self { context, ..self }
    }
}

impl UserSession {
    /// We don't want to allow any token given to the components SDK to ever be used to derive
    /// a new auth token.
    fn validate_not_derived_from_components(&self) -> FpResult<()> {
        if self.is_derived_from_components() {
            return BadRequestInto("Cannot create a new token from one issued for the components SDK");
        }
        Ok(())
    }

    fn is_derived_from_components(&self) -> bool {
        self.purposes
            .iter()
            .any(|p| matches!(p, TokenCreationPurpose::BifrostComponentsSdk))
    }

    pub fn dl_source(&self) -> DataLifetimeSource {
        if self.is_derived_from_components() {
            // Denote when data was added via components SDK, since it could be tampered with
            DataLifetimeSource::LikelyComponentsSdk
        } else {
            DataLifetimeSource::LikelyHosted
        }
    }

    /// Returns true if any token from which this token was derived was issued via tenant-facing
    /// API.
    pub fn is_from_api(&self) -> bool {
        self.purposes.iter().any(|p| p.is_from_api())
    }

    pub fn is_secondary_bo(&self) -> bool {
        self.purposes
            .iter()
            .any(|p| matches!(p, TokenCreationPurpose::SecondaryBo))
    }
}

/// Short-lived token that represents the completion of an onboarding
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ValidateUserToken {
    pub sv_id: ScopedVaultId,
    pub wf_id: Option<WorkflowId>,
    pub biz_wf_id: Option<WorkflowId>,
    pub auth_event_ids: Vec<AuthEventId>,
}

/// Longer-lived session that is sent out in emails to verify ownership
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifySession {
    // May contain old primary keys to Email rows (legacy) or primary keys to ContactInfo rows (modern)
    pub email_id: ContactInfoId,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ContactInfoVerifySessionData {
    pub uv_id: VaultId,
    pub su_id: Option<ScopedVaultId>,
    pub tenant_id: TenantId,
    pub auth_event_id: Option<AuthEventId>,
    /// The insight event created by the desktop session that sent the sms link
    pub insight_event_id: InsightEventId,
}
