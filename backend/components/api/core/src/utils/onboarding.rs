use super::vault_wrapper::{Any, PrefillData, TenantVw, VaultWrapper, WriteableVw};
use crate::{
    auth::tenant::AuthActor,
    errors::{onboarding::OnboardingError, ApiResult},
};
use db::{
    models::{
        business_owner::BusinessOwner,
        document_request::{DocumentRequest, NewDocumentRequestArgs},
        insight_event::CreateInsightEvent,
        ob_configuration::ObConfiguration,
        scoped_vault::ScopedVault,
        vault::{NewVaultArgs, Vault},
        workflow::{OnboardingWorkflowArgs, Workflow},
        workflow_request::WorkflowRequest,
    },
    TxnPgConn,
};
use itertools::chain;
use newtypes::{
    DocumentConfig, DocumentRequestConfig, EncryptedVaultPrivateKey, Selfie, VaultKind, VaultPublicKey,
    WorkflowConfig, WorkflowId, WorkflowRequestId, WorkflowSource,
};

pub struct NewBusinessVaultArgs {
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub should_create_workflow: bool,
}

pub struct NewOnboardingArgs<'a> {
    pub existing_wf_id: Option<WorkflowId>,
    pub wfr_id: Option<WorkflowRequestId>,
    pub force_create: bool,
    pub sv: &'a ScopedVault,
    pub obc: &'a ObConfiguration,
    pub insight_event: Option<CreateInsightEvent>,
    pub new_biz_args: Option<NewBusinessVaultArgs>, // has to be generated async outside the `conn`. We also currently don't support KYB for NPV's but could one day
    pub source: WorkflowSource,
    pub actor: Option<AuthActor>,
    pub maybe_prefill_data: Option<PrefillData>,
    pub is_neuro_enabled: bool,
}

#[allow(clippy::too_many_arguments)]
pub fn get_or_start_onboarding(
    conn: &mut TxnPgConn,
    args: NewOnboardingArgs,
) -> ApiResult<(WorkflowId, Option<Workflow>)> {
    let NewOnboardingArgs {
        existing_wf_id,
        wfr_id,
        force_create,
        sv,
        obc,
        insight_event,
        new_biz_args,
        source,
        actor,
        maybe_prefill_data,
        is_neuro_enabled,
    } = args;
    let user_vault = Vault::lock(conn, &sv.vault_id)?;
    if !obc.kind.can_onboard() {
        return Err(OnboardingError::CannotOnboardOntoPlaybook(obc.kind).into());
    }

    let wfr = wfr_id
        .map(|id| WorkflowRequest::get(conn, &id, &sv.id))
        .transpose()?;

    let wf_id = if let Some(wf_id) = wfr.as_ref().and_then(|wfr| wfr.workflow_id.as_ref()) {
        // This request has already been used to make a Workflow. Return that workflow.
        wf_id.clone()
    } else if let Some(wf_id) = existing_wf_id {
        // The auth token already has a workflow_id in it
        wf_id
    } else {
        // Make a new workflow. The workflow is created either for the playbook specified in the
        // auth token OR for the config specified in the WorkflowRequest
        let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &sv.id)?;
        let is_first_wf = Workflow::list(conn, &sv.id)?.is_empty();
        let has_prefill_data = maybe_prefill_data.as_ref().is_some_and(|pd| !pd.data.is_empty());
        let can_auto_authorize = vw.can_auto_authorize(has_prefill_data);
        // Create the workflow for this scoped user
        let ob_create_args = OnboardingWorkflowArgs {
            scoped_vault_id: sv.id.clone(),
            ob_configuration_id: obc.id.clone(),
            insight_event: insight_event.clone(),
            // If this isn't a one click from another tenant, we can immediately mark the WF as authorized
            authorized: can_auto_authorize,
            source,
            fixture_result: None,
            is_one_click: is_first_wf && has_prefill_data,
            wfr: wfr.clone(),
            is_neuro_enabled,
        };
        let (wf, is_new_ob) = Workflow::get_or_create_onboarding(conn, ob_create_args, force_create)?;

        if is_new_ob {
            create_doc_request_if_needed(conn, &wf, obc)?;
            if is_first_wf {
                // For the first WF created at this tenant, prefill portable data into this tenant.
                // TODO: the goal is to do this for all WFs in the future. But it's simpler to
                // start with only prefilling data once
                if let Some(prefill_data) = maybe_prefill_data {
                    let tenant_vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &sv.id)?;
                    tenant_vw.prefill_portable_data(conn, prefill_data, actor)?;
                }
            }
        }
        wf.id
    };

    if let Some(wfr) = wfr {
        if wfr.workflow_id.is_none() {
            // If we're responding to a WorkflowRequest, save that we've created a WF for the request
            WorkflowRequest::set_wf_id(conn, &wfr.id, &wf_id)?;
        }
    }

    // If the ob config has business fields, create a business vault, scoped vault, and ob
    let biz_wf = if let Some(new_biz_args) = new_biz_args {
        let existing_businesses = BusinessOwner::list_businesses(conn, &user_vault.id, &obc.id)?;
        let biz_wf = if let Some(existing) = existing_businesses.into_iter().next() {
            // If the user has already started onboarding their business onto this exact
            // ob config, we should locate it.
            // Note, this isn't quite portablizing the business since we only locate it
            // when onboarding onto the exact same ob config
            existing.1 .1
        } else {
            let args = NewVaultArgs {
                public_key: new_biz_args.public_key,
                e_private_key: new_biz_args.e_private_key,
                is_live: user_vault.is_live,
                kind: VaultKind::Business,
                is_fixture: false,
                sandbox_id: user_vault.sandbox_id.clone(), // Use the same sandbox ID for business vault
                is_created_via_api: false,
                duplicate_of_id: None,
            };
            let business_vault = Vault::create(conn, args)?;
            BusinessOwner::create_primary(conn, user_vault.id.clone(), business_vault.id.clone())?;
            let (sb, _) = ScopedVault::get_or_create(conn, &business_vault, obc.id.clone())?;
            let ob_create_args = OnboardingWorkflowArgs {
                scoped_vault_id: sb.id,
                ob_configuration_id: obc.id.clone(),
                authorized: true,
                insight_event,
                source,
                fixture_result: None,
                is_one_click: false,
                wfr: None,
                is_neuro_enabled: false, // not now
            };
            let (biz_wf, _) = Workflow::get_or_create_onboarding(conn, ob_create_args, false)?;
            biz_wf
        };
        Some(biz_wf)
    } else {
        None
    };

    Ok((wf_id, biz_wf))
}

/// Create a DocumentRequest associated with the provided wf if the obc requires document collection
fn create_doc_request_if_needed(conn: &mut TxnPgConn, wf: &Workflow, obc: &ObConfiguration) -> ApiResult<()> {
    let doc_requests_to_create = match wf.config {
        WorkflowConfig::Kyc(_) | WorkflowConfig::AlpacaKyc(_) => chain(
            // Identity documents are generally still represented in CDOs. We could migrate them
            // to `obc.documents_to_collect` one day
            obc.document_cdo().map(|cdo| DocumentRequestConfig::Identity {
                collect_selfie: cdo.selfie() == Selfie::RequireSelfie,
            }),
            obc.documents_to_collect.clone().unwrap_or_default(),
        )
        .collect(),
        WorkflowConfig::Document(DocumentConfig { ref configs }) => {
            // We used to always request an ID doc alongside PoSsn for coba. We'll soon just migrate
            // the client to send this instead of doing this implicitly
            let should_include_addl_id = configs
                .iter()
                .any(|c| matches!(c, DocumentRequestConfig::ProofOfSsn {}))
                && !configs
                    .iter()
                    .any(|c| matches!(c, DocumentRequestConfig::Identity { .. }));
            chain(
                configs.clone(),
                should_include_addl_id.then_some(DocumentRequestConfig::Identity { collect_selfie: true }),
            )
            .collect()
        }
        WorkflowConfig::Kyb(_) => {
            vec![]
        }
    };
    if doc_requests_to_create.is_empty() {
        return Ok(());
    }

    let doc_requests_to_create = doc_requests_to_create
        .into_iter()
        .map(|config| NewDocumentRequestArgs {
            scoped_vault_id: wf.scoped_vault_id.clone(),
            workflow_id: wf.id.clone(),
            rule_set_result_id: None,
            config,
        })
        .collect();

    DocumentRequest::bulk_create(conn, doc_requests_to_create)?;

    Ok(())
}
