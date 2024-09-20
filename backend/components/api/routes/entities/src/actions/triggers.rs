use crate::State;
use api_core::config::LinkKind;
use api_core::errors::tenant::TenantError;
use api_core::errors::user::UserError;
use api_core::errors::ValidationError;
use api_core::task::execute_webhook_tasks;
use api_core::utils::token::create_token;
use api_core::utils::token::CreateTokenArgs;
use api_core::utils::token::CreateTokenResult;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_wire_types::CreateTokenResponse;
use api_wire_types::EntityActionResponse;
use api_wire_types::TokenOperationKind;
use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::session::Session;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::models::workflow_request::NewWorkflowRequestArgs;
use db::models::workflow_request::WorkflowRequest;
use db::TxnPgConn;
use newtypes::DbActor;
use newtypes::DocumentRequestConfig;
use newtypes::ObConfigurationKind;
use newtypes::SessionAuthToken;
use newtypes::TriggerRequest;
use newtypes::UserSpecificWebhookKind;
use newtypes::VaultKind;
use newtypes::WorkflowRequestConfig;
use newtypes::WorkflowTriggeredInfo;

fn validate(trigger: &WorkflowRequestConfig, scoped_vault: &ScopedVault) -> FpResult<()> {
    match trigger {
        WorkflowRequestConfig::RedoKyc { .. } | WorkflowRequestConfig::Onboard { .. } => Ok(()),
        WorkflowRequestConfig::Document { configs } => {
            // Since the proceeding workflow would overwrite the scoped vault's status, we don't
            // to allow running a document workflow unless the user has already onboarded onto
            // another playbook and hopefully has a KYC status/risk signals.
            // Otherwise, the a document workflow could change a user's status to pass before any
            // KYC is run.
            // The frontend also disables these options.
            // TODO: theoretically we should be checking risk signals here too or that there's an FP decision,
            // but maybe not
            if !scoped_vault.status.is_terminal() {
                return Err(UserError::NoCompleteOnboardings.into());
            }
            DocumentRequestConfig::validate(configs)?;
            Ok(())
        }
    }
}

pub(super) struct TriggerRequestOutcome {
    token: SessionAuthToken,
    session: Session,
}

pub(super) fn apply_trigger_request(
    conn: &mut TxnPgConn,
    request: TriggerRequest,
    sv: &ScopedVault,
    actor: DbActor,
    session_key: &ScopedSealingKey,
) -> FpResult<TriggerRequestOutcome> {
    let TriggerRequest { trigger, note } = request;
    let vault = Vault::get(conn, &sv.id)?;
    validate(&trigger, sv)?;

    if vault.kind != VaultKind::Person {
        return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
    }

    let obc = if let WorkflowRequestConfig::Onboard { playbook_id } = &trigger {
        // Trigger specifically requested the playbook onto which the user should onboard
        let (obc, _) = ObConfiguration::get(conn, (playbook_id, &sv.tenant_id, sv.is_live))?;
        obc
    } else {
        // For all other trigger kinds, just associate the last playbook with the WFR.
        // This applies the same rules to from the last playbook to the WF that this creates.
        let (_, obc) =
            Workflow::latest_reonboardable(conn, &sv.id, false)?.ok_or(UserError::NoCompleteOnboardings)?;
        obc
    };
    if obc.kind == ObConfigurationKind::Auth {
        return ValidationError("Cannot triggering onboarding onto an auth playbook").into();
    }

    let wfr_args = NewWorkflowRequestArgs {
        scoped_vault_id: sv.id.clone(),
        ob_configuration_id: obc.id.clone(),
        created_by: actor.clone(),
        config: trigger,
        note,
    };
    let wfr = WorkflowRequest::create(conn, wfr_args)?;
    // Create a timeline event logging that the workflow was triggered
    let event = WorkflowTriggeredInfo {
        workflow_id: None,
        ob_config_id: Some(obc.id),
        workflow_request_id: Some(wfr.id.clone()),
        actor,
    };
    UserTimeline::create(conn, event, sv.vault_id.clone(), sv.id.clone())?;

    // Create an inherit token for the WFR
    let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;
    let args = CreateTokenArgs {
        vw: &vw,
        fp_bid: None,
        kind: TokenOperationKind::Inherit,
        key: None,
        // No scopes or auth factors - require the user to re-auth when using this token
        scopes: vec![],
        auth_events: vec![],
        limit_auth_methods: None,
        allow_reonboard: true,
    };
    let CreateTokenResult { token, session, .. } = create_token(conn, session_key, args, Duration::days(3))?;

    sv.create_webhook_task(conn, UserSpecificWebhookKind::InfoRequested)?;

    // Create an auth token for this workflow that we will send to the user
    let outcome = TriggerRequestOutcome { token, session };
    Ok(outcome)
}

impl TriggerRequestOutcome {
    pub(super) fn post_commit(self, state: &State) -> FpResult<Option<EntityActionResponse>> {
        let TriggerRequestOutcome { token, session } = self;
        // Since we may have updated users onboarding status
        execute_webhook_tasks(state.clone());

        let link = state
            .config
            .service_config
            .generate_link(LinkKind::VerifyUser, &token);

        let expires_at = session.expires_at;
        let response = CreateTokenResponse {
            token,
            link,
            expires_at,
        };
        Ok(Some(response.into()))
    }
}
