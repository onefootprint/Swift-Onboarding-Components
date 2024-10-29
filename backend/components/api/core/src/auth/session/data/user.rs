use super::onboarding::OnboardingSessionTrustedMetadata;
use super::AuthSessionData;
use crate::errors::user::UserError;
use crate::errors::ValidationError;
use crate::FpResult;
use itertools::Itertools;
use newtypes::AuthEventId;
use newtypes::AuthMethodKind;
use newtypes::BoId;
use newtypes::ContactInfoId;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSource;
use newtypes::IdentifyScope;
use newtypes::ObConfigurationId;
use newtypes::RequestedTokenScope;
use newtypes::ScopedVaultId;
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
    /// When true, allows the user to make a Workflow for a playbook they've already started
    /// onboarding onto
    allow_reonboard: bool,
    #[serde(default)]
    metadata: OnboardingSessionTrustedMetadata,
}

#[derive(Default)]
/// The nullable options in UserSession
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

pub struct NewUserSessionArgs {
    pub user_vault_id: VaultId,
    pub context: NewUserSessionContext,
    pub purposes: Vec<TokenCreationPurpose>,
    pub scopes: Vec<UserAuthScope>,
    pub auth_events: Vec<AssociatedAuthEvent>,
}

impl UserSession {
    pub fn make(args: NewUserSessionArgs) -> FpResult<AuthSessionData> {
        let NewUserSessionArgs {
            user_vault_id,
            context,
            purposes,
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
            bo_id,
            obc_id,
            wf_id,
            biz_wf_id,
            wfr_id,
            kba,
            metadata,
        } = context;
        let metadata = metadata.unwrap_or_default();
        let session = AuthSessionData::User(Self {
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
            allow_reonboard: metadata.allow_reonboard,
            metadata,
        });
        Ok(session)
    }

    pub fn update(
        &self,
        new_ctx: NewUserSessionContext,
        new_scopes: Vec<UserAuthScope>,
        new_purpose: TokenCreationPurpose,
        new_auth_event: Option<AssociatedAuthEvent>,
    ) -> FpResult<AuthSessionData> {
        self.validate_not_derived_from_components()?;
        let old = self.clone();
        // Merge context, scopes, and auth factors and create a new session with these merged fields
        let context = NewUserSessionContext {
            metadata: new_ctx.metadata.or(Some(old.metadata())),
            su_id: new_ctx.su_id.or(old.su_id),
            sb_id: new_ctx.sb_id.or(old.sb_id),
            bo_id: new_ctx.bo_id.or(old.bo_id),
            obc_id: new_ctx.obc_id.or(old.obc_id),
            wf_id: new_ctx.wf_id.or(old.wf_id),
            biz_wf_id: new_ctx.biz_wf_id.or(old.biz_wf_id),
            wfr_id: new_ctx.wfr_id.or(old.wfr_id),
            kba: new_ctx.kba.into_iter().chain(old.kba).unique().collect(),
        };
        let scopes = old.scopes.into_iter().chain(new_scopes).unique().collect();
        let auth_events = old.auth_events.into_iter().chain(new_auth_event).collect();
        let args = NewUserSessionArgs {
            user_vault_id: old.user_vault_id,
            purposes: old.purposes.into_iter().chain(Some(new_purpose)).collect(),
            context,
            scopes,
            auth_events,
        };
        UserSession::make(args)
    }

    pub fn reduce_scopes(
        &self,
        new_scopes: Vec<UserAuthScope>,
        new_purpose: TokenCreationPurpose,
    ) -> FpResult<AuthSessionData> {
        self.validate_not_derived_from_components()?;
        let old = self.clone();
        let context = NewUserSessionContext {
            metadata: Some(old.metadata()),
            su_id: old.su_id,
            sb_id: old.sb_id,
            bo_id: old.bo_id,
            obc_id: old.obc_id,
            wf_id: old.wf_id,
            biz_wf_id: old.biz_wf_id,
            wfr_id: old.wfr_id,
            kba: old.kba,
        };
        if new_scopes.iter().any(|s| !old.scopes.contains(s)) {
            // The only use case of this today is to request a token with _fewer_ scopes.
            // It could be dangerous to allow a user to request a token with _more_ scopes,
            // particularly for tokens given to the components SDK that intentially have
            // fewer scopes than their auth methods allow.
            // Do not remove this validation unless you know what you're doing.
            return ValidationError("Cannot use reduce_scopes to add additional scopes").into();
        }
        let args = NewUserSessionArgs {
            user_vault_id: old.user_vault_id,
            purposes: old.purposes.into_iter().chain(Some(new_purpose)).collect(),
            context,
            scopes: new_scopes,
            auth_events: old.auth_events,
        };
        UserSession::make(args)
    }

    /// We don't want to allow any token given to the components SDK to ever be used to derive
    /// a new auth token.
    fn validate_not_derived_from_components(&self) -> FpResult<()> {
        if self.is_derived_from_components() {
            return ValidationError("Cannot create a new token from one issued for the components SDK")
                .into();
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

    pub fn metadata(&self) -> OnboardingSessionTrustedMetadata {
        // TODO remove this after deprecating allow_reonboard
        if self.allow_reonboard {
            // Legacy token that doesn't have the metadata field
            OnboardingSessionTrustedMetadata {
                allow_reonboard: true,
            }
        } else {
            self.metadata.clone()
        }
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
