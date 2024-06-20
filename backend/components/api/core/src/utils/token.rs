use super::session::AuthSession;
use crate::auth::session::user::AssociatedAuthEvent;
use crate::auth::session::user::NewUserSessionArgs;
use crate::auth::session::user::NewUserSessionContext;
use crate::auth::session::user::TokenCreationPurpose;
use crate::auth::session::user::UserSession;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiResult;
use crate::errors::ValidationError;
use api_wire_types::TokenOperationKind;
use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::session::Session;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::models::workflow_request::WorkflowRequest;
use db::TxnPgConn;
use newtypes::AuthMethodKind;
use newtypes::ObConfigurationKey;
use newtypes::SessionAuthToken;
use newtypes::UserAuthScope;
use newtypes::VaultKind;

pub struct CreateTokenArgs {
    pub sv: ScopedVault,
    pub kind: TokenOperationKind,
    pub key: Option<ObConfigurationKey>,
    pub scopes: Vec<UserAuthScope>,
    pub auth_events: Vec<AssociatedAuthEvent>,
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
        limit_auth_methods,
    } = args;

    let vault = Vault::get(conn, &sv.vault_id)?;
    if vault.kind != VaultKind::Person {
        return Err(ValidationError("Cannot create a token for a non-person vault").into());
    }

    if key.is_some() && !kind.allow_obc_key() {
        return Err(ValidationError("Cannot provide playbook key for this token kind").into());
    }
    if limit_auth_methods.is_some() && !kind.allow_limit_auth_methods() {
        return Err(ValidationError("Cannot provide limit_auth_methods for this token kind").into());
    }

    // Determine arguments for the auth token based on the requested operation
    let (purpose, obc_id, wfr) = match kind {
        TokenOperationKind::User => (TokenCreationPurpose::ApiUser, None, None),
        TokenOperationKind::Inherit => {
            // Inherit the WorkflowRequest
            let wfr = WorkflowRequest::get_active(conn, &sv.id)?
                .ok_or(ValidationError("No outstanding info is requested from this user"))?;
            // Do we want to replace the obc.id on the auth token?

            let obc_id = wfr.ob_configuration_id.clone();
            (TokenCreationPurpose::ApiInherit, Some(obc_id), Some(wfr))
        }
        TokenOperationKind::Reonboard => {
            let (_, obc) = Workflow::latest_reonboardable(conn, &sv.id, true)?.ok_or(ValidationError(
                "Cannot reonboard user - user has no complete onboardings.",
            ))?;
            (TokenCreationPurpose::ApiReonboard, Some(obc.id), None)
        }
        TokenOperationKind::Onboard => {
            let key = key.ok_or(ValidationError(
                "key must be provided for a token of kind onboard",
            ))?;
            let (obc, _) = ObConfiguration::get(conn, (&key, &sv.tenant_id, sv.is_live))?;
            if !obc.kind.can_onboard() {
                return Err(OnboardingError::CannotOnboardOntoPlaybook(obc.kind).into());
            }
            (TokenCreationPurpose::ApiOnboard, Some(obc.id), None)
        }
        TokenOperationKind::UpdateAuthMethods => (
            TokenCreationPurpose::ApiUpdateAuthMethods { limit_auth_methods },
            None,
            None,
        ),
    };

    let context = NewUserSessionContext {
        su_id: Some(sv.id),
        obc_id,
        wfr_id: wfr.as_ref().map(|wfr| wfr.id.clone()),
        ..Default::default()
    };
    let args = NewUserSessionArgs {
        user_vault_id: sv.vault_id,
        purposes: vec![purpose],
        context,
        scopes,
        auth_events,
    };
    let data = UserSession::make(args)?;
    let (token, session) = AuthSession::create_sync(conn, session_key, data, duration)?;
    let result = CreateTokenResult { token, session, wfr };
    Ok(result)
}
