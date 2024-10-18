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
use db::models::ob_configuration::ObConfigurationQuery;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultIdentifier;
use db::models::session::Session;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::models::workflow_request::NewWorkflowRequestArgs;
use db::models::workflow_request::WorkflowRequest;
use db::OffsetPagination;
use db::TxnPgConn;
use newtypes::ApiKeyStatus;
use newtypes::DbActor;
use newtypes::DocumentRequestConfig;
use newtypes::ObConfigurationKind;
use newtypes::SessionAuthToken;
use newtypes::TriggerRequest;
use newtypes::UserSpecificWebhookKind;
use newtypes::VaultKind;
use newtypes::WorkflowRequestConfig;
use newtypes::WorkflowTriggeredInfo;

fn validate(trigger: &WorkflowRequestConfig, sb: Option<&ScopedVault>) -> FpResult<()> {
    match trigger {
        WorkflowRequestConfig::Onboard { .. } => Ok(()),
        WorkflowRequestConfig::Document {
            configs,
            business_configs,
            fp_bid: _,
        } => {
            DocumentRequestConfig::validate(configs)?;
            DocumentRequestConfig::validate(business_configs)?;
            if business_configs.iter().any(|c| !c.is_custom()) {
                return ValidationError("business_configs can only contain custom document requests").into();
            }
            let has_sb = sb.is_some();
            let has_business_configs = !business_configs.is_empty();
            if has_sb != has_business_configs {
                return ValidationError("fp_bid and business_configs must both be provided together").into();
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
    su: &ScopedVault,
    actor: DbActor,
    session_key: &ScopedSealingKey,
) -> FpResult<TriggerRequestOutcome> {
    let TriggerRequest {
        trigger,
        note,
        fp_bid,
    } = request;

    let fp_bid = fp_bid.as_ref().or(match &trigger {
        // TODO move fp_bid out of the workflow_request config here once the client has been updated
        WorkflowRequestConfig::Document { fp_bid, .. } => fp_bid.as_ref(),
        _ => None,
    });
    let sb = fp_bid
        .map(|fp_bid| {
            let uv_id = &su.vault_id;
            let id = ScopedVaultIdentifier::OwnedFpBid { fp_bid, uv_id };
            ScopedVault::get(conn, id)
        })
        .transpose()?;

    validate(&trigger, sb.as_ref())?;

    let vault = Vault::get(conn, &su.id)?;
    if vault.kind != VaultKind::Person {
        return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
    }

    let obc = match &trigger {
        WorkflowRequestConfig::Onboard { playbook_id } => {
            // Trigger specifically requested the playbook onto which the user should onboard
            let (obc, _) = ObConfiguration::get(conn, (playbook_id, &su.tenant_id, su.is_live))?;
            obc
        }
        WorkflowRequestConfig::Document { .. } => {
            // For all other trigger kinds, just associate the last playbook with the WFR.
            // This is mostly just used to serialize information on the tenant. Would be nice if we could stop
            // associated a playbook with these WFRs
            if let Some((_, obc)) = Workflow::latest_reonboardable(conn, &su.id, false)? {
                obc
            } else {
                // This is a hack: these triggers all need a playbook associated to display various tenant
                // information. Select the most recently created playbook to randomly associate with this
                // workflow. Its rules will not be used...
                let query = ObConfigurationQuery {
                    tenant_id: su.tenant_id.clone(),
                    is_live: su.is_live,
                    status: Some(ApiKeyStatus::Enabled),
                    kinds: Some(ObConfigurationKind::reonboardable()),
                    search: None,
                };

                let (obcs, _) = ObConfiguration::list(conn, &query, OffsetPagination::page(1))?;
                let (obc, _, _) = obcs.into_iter().next().ok_or(UserError::NoPlaybooksExist)?;
                obc
            }
            // Both of these methods choose a pretty arbitrary playbook. This will have minor
            // effects in bifrost any place where bifrost reads a playbook setting that
            // is technically not pertinent to the document workflow.
            // https://github.com/onefootprint/monorepo/blob/bf8d6eb7e391e66ccafe73bbd2866d427160da54/frontend/packages/types/src/data/onboarding-config.ts#L51
        }
    };
    if obc.kind == ObConfigurationKind::Auth {
        return ValidationError("Cannot trigger onboarding onto an auth playbook").into();
    }

    let wfr_args = NewWorkflowRequestArgs {
        su_id: &su.id,
        sb_id: sb.as_ref().map(|sb| &sb.id),
        ob_configuration_id: &obc.id,
        created_by: &actor,
        config: &trigger,
        note,
    };

    let wfr = WorkflowRequest::create(conn, wfr_args)?;

    // Create a timeline event logging that the workflow was triggered
    let event = WorkflowTriggeredInfo {
        workflow_id: None,
        ob_config_id: obc.id,
        workflow_request_id: Some(wfr.id.clone()),
        actor,
    };
    UserTimeline::create(conn, event.clone(), su.vault_id.clone(), su.id.clone())?;

    // Create the same workflow request timeline event on the business to indicate that the workflow was
    // triggered
    if let Some(sb) = sb.as_ref() {
        UserTimeline::create(conn, event, sb.vault_id.clone(), sb.id.clone())?;
    }

    // Create an inherit token for the WFR
    let vw = VaultWrapper::<Any>::build_for_tenant(conn, &su.id)?;
    let args = CreateTokenArgs {
        vw: &vw,
        sb_id: sb.map(|sb| sb.id),
        kind: TokenOperationKind::Inherit,
        key: None,
        // No scopes or auth factors - require the user to re-auth when using this token
        scopes: vec![],
        auth_events: vec![],
        limit_auth_methods: None,
        allow_reonboard: true,
    };
    let CreateTokenResult { token, session, .. } = create_token(conn, session_key, args, Duration::days(3))?;

    su.create_webhook_task(conn, UserSpecificWebhookKind::InfoRequested)?;

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
