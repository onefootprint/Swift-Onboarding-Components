use super::vault_wrapper::Any;
use super::vault_wrapper::PrefillData;
use super::vault_wrapper::TenantVw;
use super::vault_wrapper::VaultWrapper;
use super::vault_wrapper::WriteableVw;
use crate::auth::tenant::AuthActor;
use crate::errors::onboarding::OnboardingError;
use crate::FpResult;
use db::models::business_owner::BusinessOwner;
use db::models::document_request::DocumentRequest;
use db::models::document_request::NewDocumentRequestArgs;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::IsNew;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultIdentifier;
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use db::models::workflow::OnboardingWorkflowArgs;
use db::models::workflow::Workflow;
use db::models::workflow_request::WorkflowRequest;
use db::OffsetPagination;
use db::TxnPgConn;
use itertools::chain;
use itertools::Itertools;
use newtypes::DocumentConfig;
use newtypes::DocumentRequestConfig;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::ScopedVaultId;
use newtypes::Selfie;
use newtypes::VaultKind;
use newtypes::VaultPublicKey;
use newtypes::WorkflowConfig;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowId;
use newtypes::WorkflowRequestId;
use newtypes::WorkflowSource;

pub enum NewBusinessWfArgs {
    /// There's no scoped business selected. Create a new business vault with the provided keypair,
    /// if no existing business vault exists for this playbook. Then create a workflow for this new
    /// SB.
    MaybeNewVaultAndWf {
        public_key: VaultPublicKey,
        e_private_key: EncryptedVaultPrivateKey,
    },
    /// Theres already an existing scoped business - just create a new workflow attached to the SB.
    NewWorkflow { sb_id: ScopedVaultId },
}

pub struct NewOnboardingArgs<'a> {
    pub existing_wf_id: Option<WorkflowId>,
    pub wfr_id: Option<WorkflowRequestId>,
    pub force_create: bool,
    pub sv: &'a ScopedVault,
    pub obc: &'a ObConfiguration,
    pub insight_event: Option<CreateInsightEvent>,
    // Has to be generated async outside the `conn`. We also currently don't support KYB for NPV's but could
    // one day
    pub new_biz_args: Option<NewBusinessWfArgs>,
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub kyb_fixture_result: Option<WorkflowFixtureResult>,
    pub source: WorkflowSource,
    pub actor: Option<AuthActor>,
    pub maybe_prefill_data: Option<PrefillData>,
    pub is_neuro_enabled: bool,
    pub is_secondary_bo: bool,
}

#[allow(clippy::too_many_arguments)]
pub fn get_or_start_onboarding(
    conn: &mut TxnPgConn,
    args: NewOnboardingArgs,
) -> FpResult<(WorkflowId, Option<Workflow>, IsNew)> {
    let NewOnboardingArgs {
        existing_wf_id,
        wfr_id,
        force_create,
        sv,
        obc,
        insight_event,
        new_biz_args,
        source,
        fixture_result,
        kyb_fixture_result,
        actor,
        maybe_prefill_data,
        is_neuro_enabled,
        is_secondary_bo,
    } = args;
    let user_vault = Vault::lock(conn, &sv.vault_id)?;
    if !obc.kind.can_onboard() {
        return Err(OnboardingError::CannotOnboardOntoPlaybook(obc.kind).into());
    }

    let wfr = wfr_id
        .map(|id| WorkflowRequest::get(conn, &id, &sv.id))
        .transpose()?;

    let (wf_id, is_new_ob) = if let Some(wf_id) = wfr.as_ref().and_then(|wfr| wfr.workflow_id.as_ref()) {
        // This request has already been used to make a Workflow. Return that workflow.
        (wf_id.clone(), false)
    } else if let Some(wf_id) = existing_wf_id {
        // The auth token already has a workflow_id in it
        (wf_id, false)
    } else {
        // Make a new workflow. The workflow is created either for the playbook specified in the
        // auth token OR for the config specified in the WorkflowRequest
        let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &sv.id)?;
        let (wfs, _) = Workflow::list(conn, &sv.id, OffsetPagination::new(None, 10))?;
        let is_first_wf = wfs.is_empty();
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
            fixture_result,
            is_one_click: is_first_wf && has_prefill_data,
            wfr: wfr.clone(),
            is_neuro_enabled,
        };
        let (wf, is_new_ob) = Workflow::get_or_create_onboarding(conn, ob_create_args, force_create)?;

        if is_new_ob && is_first_wf {
            // For the first WF created at this tenant, prefill portable data into this tenant.
            // TODO: the goal is to do this for all WFs in the future. But it's simpler to
            // start with only prefilling data once
            if let Some(prefill_data) = maybe_prefill_data {
                let tenant_vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &sv.id)?;
                tenant_vw.prefill_portable_data(conn, prefill_data, actor)?;
            }
        }
        (wf.id, is_new_ob)
    };

    if let Some(wfr) = wfr {
        if wfr.workflow_id.is_none() {
            // If we're responding to a WorkflowRequest, save that we've created a WF for the request
            WorkflowRequest::set_wf_id(conn, &wfr.id, &wf_id)?;
        }
    }

    let args = CreateBusinessWfArgs {
        new_biz_args,
        obc,
        uv: &user_vault,
        insight_event,
        source,
        // Default to the same fixture result for KYB as KYC if none provided
        fixture_result: kyb_fixture_result.or(fixture_result),
        force_create,
    };
    let biz_wf = maybe_create_business_wf(conn, args)?;

    if is_new_ob {
        maybe_create_doc_requests(conn, &wf_id, biz_wf.as_ref(), obc, is_secondary_bo)?;
    }

    Ok((wf_id, biz_wf, is_new_ob))
}

struct CreateBusinessWfArgs<'a> {
    new_biz_args: Option<NewBusinessWfArgs>,
    obc: &'a ObConfiguration,
    uv: &'a Vault,
    insight_event: Option<CreateInsightEvent>,
    source: WorkflowSource,
    fixture_result: Option<WorkflowFixtureResult>,
    force_create: bool,
}

fn maybe_create_business_wf(conn: &mut TxnPgConn, args: CreateBusinessWfArgs) -> FpResult<Option<Workflow>> {
    let CreateBusinessWfArgs {
        new_biz_args,
        obc,
        uv,
        insight_event,
        source,
        fixture_result,
        force_create,
    } = args;
    let Some(new_biz_args) = new_biz_args else {
        return Ok(None);
    };
    let sb = match new_biz_args {
        NewBusinessWfArgs::NewWorkflow { sb_id } => {
            // A scoped business has been attached to this session already, usually via user-specific
            // sessions.
            let sb = ScopedVault::get(conn, &sb_id)?;
            let id = ScopedVaultIdentifier::OwnedFpBid {
                fp_bid: &sb.fp_id,
                uv_id: &uv.id,
            };
            ScopedVault::get(conn, id)?
        }
        NewBusinessWfArgs::MaybeNewVaultAndWf {
            public_key,
            e_private_key,
        } => {
            // TODO don't always create a new business vault - once we have portable businesses,
            // we should display to the client an ability to select the business they want to use
            let existing_businesses = BusinessOwner::list_businesses_for_playbook(conn, &uv.id, &obc.id)?;
            if let Some(existing) = existing_businesses.into_iter().next() {
                // If the user has already started onboarding their business onto this exact
                // ob config, we should locate it.
                // Note, this isn't quite portablizing the business since we only locate it
                // when onboarding onto the exact same ob config
                return Ok(Some(existing.1 .1));
            }
            let args = NewVaultArgs {
                public_key,
                e_private_key,
                is_live: uv.is_live,
                kind: VaultKind::Business,
                is_fixture: false,
                sandbox_id: uv.sandbox_id.clone(), // Use the same sandbox ID for business vault
                is_created_via_api: false,
                duplicate_of_id: None,
            };
            let business_vault = Vault::create(conn, args)?;
            BusinessOwner::create_primary(conn, uv.id.clone(), business_vault.id.clone())?;
            let (sb, _) = ScopedVault::get_or_create_for_playbook(conn, &business_vault, obc.id.clone())?;
            sb
        }
    };
    let ob_create_args = OnboardingWorkflowArgs {
        scoped_vault_id: sb.id,
        ob_configuration_id: obc.id.clone(),
        authorized: true,
        insight_event,
        source,
        fixture_result,
        is_one_click: false,
        wfr: None,
        is_neuro_enabled: false, // not now
    };
    let (biz_wf, _) = Workflow::get_or_create_onboarding(conn, ob_create_args, force_create)?;
    Ok(Some(biz_wf))
}

/// Create DocumentRequests associated with the provided wfs if the obc requires document collection
fn maybe_create_doc_requests(
    conn: &mut TxnPgConn,
    wf_id: &WorkflowId,
    biz_wf: Option<&Workflow>,
    obc: &ObConfiguration,
    is_secondary_bo: bool,
) -> FpResult<()> {
    let wf = Workflow::get(conn, wf_id)?;
    let user_doc_requests = match wf.config {
        WorkflowConfig::Kyc(_) | WorkflowConfig::AlpacaKyc(_) => chain(
            // Identity documents are generally still represented in CDOs. We could migrate them
            // to `obc.documents_to_collect` one day
            obc.document_cdo().map(|cdo| DocumentRequestConfig::Identity {
                collect_selfie: cdo.selfie() == Selfie::RequireSelfie,
            }),
            obc.documents_to_collect.clone().unwrap_or_default(),
        )
        .collect(),
        WorkflowConfig::Document(DocumentConfig { ref configs }) => configs.clone(),
        WorkflowConfig::Kyb(_) => {
            vec![]
        }
    };
    let user_doc_requests = user_doc_requests.into_iter().map(|r| (r, &wf));
    let biz_doc_requests = (!is_secondary_bo)
        .then_some(obc.business_documents_to_collect.clone())
        .into_iter()
        .flatten()
        .flat_map(|r| biz_wf.map(|biz_wf| (r, biz_wf)));


    let doc_requests_to_create = chain!(user_doc_requests, biz_doc_requests)
        .map(|(config, wf)| NewDocumentRequestArgs {
            scoped_vault_id: wf.scoped_vault_id.clone(),
            workflow_id: wf.id.clone(),
            rule_set_result_id: None,
            config,
        })
        .collect_vec();

    if doc_requests_to_create.is_empty() {
        return Ok(());
    }
    DocumentRequest::bulk_create(conn, doc_requests_to_create)?;

    Ok(())
}
