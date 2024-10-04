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
use db::models::business_owner::BusinessOwner;
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

fn validate(
    conn: &mut TxnPgConn,
    trigger: &WorkflowRequestConfig,
    scoped_vault: &ScopedVault,
) -> FpResult<()> {
    match trigger {
        WorkflowRequestConfig::RedoKyc { .. } | WorkflowRequestConfig::Onboard { .. } => Ok(()),
        WorkflowRequestConfig::Document {
            configs,
            fp_bid,
            business_configs,
        } => {
            DocumentRequestConfig::validate(configs)?;
            match (fp_bid, business_configs) {
                (Some(fp_bid), business_configs) if !business_configs.is_empty() => {
                    DocumentRequestConfig::validate(business_configs)?;
                    if business_configs.iter().any(|c| !c.is_custom()) {
                        return ValidationError("business_configs can only contain custom document requests")
                            .into();
                    }
                    let sb = ScopedVault::get(conn, (fp_bid, &scoped_vault.tenant_id, scoped_vault.is_live))?;
                    let bos = BusinessOwner::list_all(conn, &sb.vault_id, &scoped_vault.tenant_id)?;
                    let is_bo = bos
                        .iter()
                        .flat_map(|(_, bo)| bo)
                        .any(|(sv, _)| sv.id == scoped_vault.id);
                    if !is_bo {
                        return ValidationError(
                            "Provided user is not a beneficial owner of the provided business",
                        )
                        .into();
                    }
                }
                (None, business_configs) if business_configs.is_empty() => (),
                (_, _) => {
                    return ValidationError("fp_bid and business_configs must both be provided together")
                        .into()
                }
            }

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
    let fp_bid = match &trigger {
        WorkflowRequestConfig::Document { fp_bid, .. } => fp_bid.clone(),
        _ => None,
    };

    let vault = Vault::get(conn, &sv.id)?;
    validate(conn, &trigger, sv)?;

    if vault.kind != VaultKind::Person {
        return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
    }

    let obc = if let WorkflowRequestConfig::Onboard { playbook_id } = &trigger {
        // Trigger specifically requested the playbook onto which the user should onboard
        let (obc, _) = ObConfiguration::get(conn, (playbook_id, &sv.tenant_id, sv.is_live))?;
        obc
    } else {
        // For all other trigger kinds, just associate the last playbook with the WFR.
        // This is mostly just used to serialize information on the tenant. Would be nice if we could stop
        // associated a playbook with these WFRs
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
    UserTimeline::create(conn, event.clone(), sv.vault_id.clone(), sv.id.clone())?;

    // Create the same workflow request timeline event on the business to indicate that the workflow was
    // triggered
    if let Some(fp_bid) = fp_bid.clone() {
        let sb = ScopedVault::get(conn, (&fp_bid, &sv.tenant_id, sv.is_live))?;
        UserTimeline::create(conn, event, sb.vault_id.clone(), sb.id.clone())?;
    }

    // Create an inherit token for the WFR
    let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;
    let args = CreateTokenArgs {
        vw: &vw,
        fp_bid,
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
