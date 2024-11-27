use crate::State;
use api_core::config::LinkKind;
use api_core::errors::tenant::TenantError;
use api_core::errors::user::UserError;
use api_core::task::execute_webhook_tasks;
use api_core::utils::session::AuthSession;
use api_core::utils::token::create_token;
use api_core::utils::token::CreateTokenArgs;
use api_core::utils::token::CreateTokenResult;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_errors::BadRequestInto;
use api_wire_types::CreateTokenResponse;
use api_wire_types::EntityActionResponse;
use api_wire_types::TokenOperationKind;
use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationQuery;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultIdentifier;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::models::workflow_request::NewWorkflowRequestArgs;
use db::models::workflow_request::WorkflowRequest;
use db::OffsetPagination;
use db::PgConn;
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

fn validate(
    conn: &mut PgConn,
    trigger: &WorkflowRequestConfig,
    su: &ScopedVault,
    sb: Option<&ScopedVault>,
) -> FpResult<()> {
    let has_sb = sb.is_some();
    match trigger {
        WorkflowRequestConfig::Onboard {
            playbook_id,
            recollect_attributes: attrs,
            reuse_existing_bo_kyc,
        } => {
            let (_, obc) = ObConfiguration::get(conn, (playbook_id, &su.tenant_id, su.is_live))?;
            if attrs.iter().any(|cdo| !obc.must_collect_data.contains(cdo)) {
                return BadRequestInto("recollect_attributes must be a subset of the playbook's data");
            }
            let is_kyb = obc.kind == ObConfigurationKind::Kyb;
            if *reuse_existing_bo_kyc && !is_kyb {
                return BadRequestInto("reuse_existing_bo_kyc can only be used with KYB playbooks");
            }
            if has_sb && !is_kyb {
                return BadRequestInto("Must provide a KYB playbook when providing fp_bid");
            }
            // Temporary until we implement this
            if has_sb && !*reuse_existing_bo_kyc {
                return BadRequestInto("Must provide reuse_existing_bo_kyc for KYB flows");
            }
        }
        WorkflowRequestConfig::Document {
            configs,
            business_configs,
        } => {
            DocumentRequestConfig::validate(configs)?;
            DocumentRequestConfig::validate(business_configs)?;
            if business_configs.iter().any(|c| !c.is_custom()) {
                return BadRequestInto("business_configs can only contain custom document requests");
            }
            let has_business_configs = !business_configs.is_empty();
            if has_sb != has_business_configs {
                return BadRequestInto("fp_bid and business_configs must both be provided together");
            }
        }
    }
    Ok(())
}

pub(super) struct TriggerRequestOutcome {
    token: SessionAuthToken,
    session: AuthSession,
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

    if su.kind != VaultKind::Person {
        return BadRequestInto("Must be a person vault");
    }

    let sb = fp_bid
        .as_ref()
        .map(|fp_bid| {
            let uv_id = &su.vault_id;
            let id = ScopedVaultIdentifier::OwnedFpBid { fp_bid, uv_id };
            ScopedVault::get(conn, id)
        })
        .transpose()?;

    validate(conn, &trigger, su, sb.as_ref())?;

    let vault = Vault::get(conn, &su.id)?;
    if vault.kind != VaultKind::Person {
        return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
    }

    let obc = match &trigger {
        WorkflowRequestConfig::Onboard { playbook_id, .. } => {
            // Trigger specifically requested the playbook onto which the user should onboard
            let (_, obc) = ObConfiguration::get(conn, (playbook_id, &su.tenant_id, su.is_live))?;
            obc
        }
        WorkflowRequestConfig::Document { .. } => {
            // For all other trigger kinds, just associate the last playbook with the WFR.
            // This is mostly just used to serialize information on the tenant. Would be nice if we could stop
            // associating a playbook with these WFRs
            if let Some((_, obc)) = Workflow::latest_reonboardable(conn, &su.id, false)? {
                obc
            } else {
                // Overall hack: these triggers all need a playbook associated to display various tenant
                // information. Select the most recently created playbook to randomly associate with this
                // workflow. Its rules will not be used...

                // KYB specific hack: if `fp_bid` is provided, we're in the context of requesting a document
                // about a business from a BO. We have validations that we can only create biz
                // wfs for KYB playbooks, so we need to inject that here
                let kinds = if fp_bid.is_some() {
                    vec![ObConfigurationKind::Kyb]
                } else {
                    ObConfigurationKind::reonboardable()
                };
                let query = ObConfigurationQuery {
                    tenant_id: su.tenant_id.clone(),
                    is_live: su.is_live,
                    status: Some(ApiKeyStatus::Enabled),
                    kinds: Some(kinds),
                    search: None,
                    playbook_id: None,
                    include_deactivated_versions: false,
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
        return BadRequestInto("Cannot trigger onboarding onto an auth playbook");
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
        wf: None,
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
