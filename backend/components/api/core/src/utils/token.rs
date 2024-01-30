use super::session::AuthSession;
use crate::auth::session::user::{AssociatedAuthEvent, NewUserSessionArgs, UserSessionPurpose};
use crate::auth::user::UserAuthScope;
use crate::{
    auth::session::user::{NewUserSessionContext, UserSession},
    errors::{onboarding::OnboardingError, ApiResult, ValidationError},
};
use api_wire_types::TokenOperationKind;
use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::models::vault::Vault;
use db::{
    models::{
        ob_configuration::ObConfiguration, scoped_vault::ScopedVault, session::Session, workflow::Workflow,
        workflow_request::WorkflowRequest,
    },
    TxnPgConn,
};
use newtypes::{AuthMethodKind, ObConfigurationKey, SessionAuthToken, VaultKind};

pub struct CreateTokenArgs {
    pub sv: ScopedVault,
    pub kind: TokenOperationKind,
    pub key: Option<ObConfigurationKey>,
    pub scopes: Vec<UserAuthScope>,
    pub auth_events: Vec<AssociatedAuthEvent>,
    pub is_implied_auth: bool,
    pub limit_auth_methods: Option<Vec<AuthMethodKind>>,
}

pub struct CreateTokenResult {
    pub token: SessionAuthToken,
    pub session: Session,
    /// For Inherit tokens, the WorkflowRequest being inherited
    pub wfr: Option<WorkflowRequest>,
}

pub fn create_token(
    conn: &mut TxnPgConn,
    session_key: &ScopedSealingKey,
    args: CreateTokenArgs,
    duration: Duration,
) -> ApiResult<CreateTokenResult> {
    let CreateTokenArgs {
        sv,
        kind,
        key,
        scopes,
        auth_events,
        is_implied_auth,
        limit_auth_methods,
    } = args;

    let vault = Vault::get(conn, &sv.vault_id)?;
    if vault.kind != VaultKind::Person {
        return Err(ValidationError("Cannot create a token for a non-person vault").into());
    }

    if key.is_some() && !kind.allow_obc_key() {
        return Err(ValidationError("Cannot provide playbook key for this operation").into());
    }
    if limit_auth_methods.is_some() && !kind.allow_limit_auth_methods() {
        return Err(ValidationError("Cannot provide limit_auth_methods for this operation").into());
    }

    // Determine arguments for the auth token based on the requested operation
    let (purpose, obc_id, wfr) = match kind {
        TokenOperationKind::User => (UserSessionPurpose::ApiUser, None, None),
        TokenOperationKind::Inherit => {
            // Inherit the WorkflowRequest
            let wfr = WorkflowRequest::get_active(conn, &sv.id)?
                .ok_or(ValidationError("No outstanding info is requested from this user"))?;
            // Do we want to replace the obc.id on the auth token?

            let obc_id = wfr.ob_configuration_id.clone();
            (UserSessionPurpose::ApiInherit, Some(obc_id), Some(wfr))
        }
        TokenOperationKind::Reonboard => {
            let (_, obc) = Workflow::latest(conn, &sv.id, true)?.ok_or(ValidationError(
                "Cannot reonboard user - user has no complete onboardings.",
            ))?;
            (UserSessionPurpose::ApiReonboard, Some(obc.id), None)
        }
        TokenOperationKind::Onboard => {
            let key = key.ok_or(ValidationError(
                "key must be provided for a token of kind onboard",
            ))?;
            let (obc, _) = ObConfiguration::get(conn, (&key, &sv.tenant_id, sv.is_live))?;
            if !obc.kind.can_onboard() {
                return Err(OnboardingError::CannotOnboardOntoPlaybook(obc.kind).into());
            }
            (UserSessionPurpose::ApiOnboard, Some(obc.id), None)
        }
        TokenOperationKind::UpdateAuthMethods => (
            UserSessionPurpose::ApiUpdateAuthMethods { limit_auth_methods },
            None,
            None,
        ),
    };

    let context = NewUserSessionContext {
        su_id: Some(sv.id),
        obc_id,
        is_implied_auth,
        wfr_id: wfr.as_ref().map(|wfr| wfr.id.clone()),
        ..Default::default()
    };
    let args = NewUserSessionArgs {
        user_vault_id: sv.vault_id,
        purpose,
        context,
        scopes,
        auth_events,
    };
    let data = UserSession::make(args)?;
    let (token, session) = AuthSession::create_sync(conn, session_key, data, duration)?;
    let result = CreateTokenResult { token, session, wfr };
    Ok(result)
}
