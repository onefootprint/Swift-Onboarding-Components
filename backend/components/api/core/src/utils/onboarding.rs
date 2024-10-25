use super::vault_wrapper::Any;
use super::vault_wrapper::PrefillData;
use super::vault_wrapper::TenantVw;
use super::vault_wrapper::VaultWrapper;
use super::vault_wrapper::WriteableVw;
use crate::auth::tenant::AuthActor;
use crate::auth::user::UserSessionContext;
use crate::enclave_client::VaultKeyPair;
use crate::errors::onboarding::OnboardingError;
use crate::FpResult;
use api_errors::AssertionError;
use api_errors::ValidationError;
use db::errors::FpOptionalExtension;
use db::models::business_owner::BoIdentifier;
use db::models::business_owner::BusinessOwner;
use db::models::business_workflow_link::BusinessWorkflowLink;
use db::models::business_workflow_link::NewBusinessWorkflowLinkRow;
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
use db::models::workflow_request_junction::WorkflowRequestJunction;
use db::OffsetPagination;
use db::TxnPgConn;
use itertools::chain;
use itertools::Itertools;
use newtypes::BoId;
use newtypes::BusinessWorkflowLinkSource;
use newtypes::DataLifetimeSeqno;
use newtypes::DocumentConfig;
use newtypes::DocumentRequestConfig;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::KybConfig;
use newtypes::ObConfigurationKind;
use newtypes::ScopedVaultId;
use newtypes::Selfie;
use newtypes::VaultKind;
use newtypes::VaultPublicKey;
use newtypes::WorkflowConfig;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowId;
use newtypes::WorkflowSource;

#[derive(Debug)]
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

#[derive(Clone)]
pub struct CommonWfArgs<'a> {
    pub obc: &'a ObConfiguration,
    pub insight_event: Option<CreateInsightEvent>,
    pub source: WorkflowSource,
    pub wfr: Option<&'a WorkflowRequest>,
    pub force_create: bool,
    pub su: &'a ScopedVault,
}

pub struct CreateUserWfArgs {
    pub existing_wf_id: Option<WorkflowId>,
    pub seqno: DataLifetimeSeqno,
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub actor: Option<AuthActor>,
    pub maybe_prefill_data: Option<PrefillData>,
    pub is_neuro_enabled: bool,
}

#[tracing::instrument("get_or_create_user_workflow", skip_all)]
pub fn get_or_create_user_workflow(
    conn: &mut TxnPgConn,
    common_args: CommonWfArgs,
    user_args: CreateUserWfArgs,
) -> FpResult<(Workflow, IsNew)> {
    let CommonWfArgs {
        obc,
        insight_event,
        source,
        wfr,
        force_create,
        su,
    } = common_args;
    let CreateUserWfArgs {
        existing_wf_id,
        seqno,
        fixture_result,
        actor,
        maybe_prefill_data,
        is_neuro_enabled,
    } = user_args;

    let wfr_junction = wfr
        .as_ref()
        .map(|wfr| WorkflowRequestJunction::get(conn, &wfr.id, &su.id))
        .transpose()?;
    if let Some(wf_id) = wfr_junction.and_then(|wfr| wfr.workflow_id) {
        // This request has already been used to make a Workflow. Return that workflow.
        let wf = Workflow::get(conn, &wf_id)?;
        return Ok((wf, false));
    }
    if let Some(wf_id) = existing_wf_id {
        // The auth token already has a workflow_id in it, no need to make a new one
        let wf = Workflow::get(conn, &wf_id)?;
        return Ok((wf, false));
    }

    //
    // Get or create a workflow
    //

    Vault::lock(conn, &su.vault_id)?;
    if !obc.kind.can_onboard() {
        return Err(OnboardingError::CannotOnboardOntoPlaybook(obc.kind).into());
    }

    // Make a new workflow. The workflow is created either for the playbook specified in the
    // auth token OR for the config specified in the WorkflowRequest
    let vw: TenantVw<Any> = VaultWrapper::build_for_tenant_version(conn, &su.id, seqno)?;
    let (wfs, _) = Workflow::list(conn, &su.id, OffsetPagination::new(None, 10))?;
    let is_first_wf = wfs.is_empty();
    let has_prefill_data = maybe_prefill_data.as_ref().is_some_and(|pd| !pd.data.is_empty());
    let can_auto_authorize = vw.can_auto_authorize(has_prefill_data);
    // Create the workflow for this scoped user
    let ob_create_args = OnboardingWorkflowArgs {
        scoped_vault_id: su.id.clone(),
        ob_configuration_id: obc.id.clone(),
        insight_event: insight_event.clone(),
        // If this isn't a one click from another tenant, we can immediately mark the WF as authorized
        authorized: can_auto_authorize,
        source,
        fixture_result,
        is_one_click: is_first_wf && has_prefill_data,
        wfr,
        is_neuro_enabled,
    };
    let (wf, is_new_wf) = Workflow::get_or_create_onboarding(conn, ob_create_args, force_create)?;

    if is_new_wf && is_first_wf {
        // For the first WF created at this tenant, prefill portable data into this tenant.
        // TODO: the goal is to do this for all WFs in the future. But it's simpler to
        // start with only prefilling data once
        if let Some(prefill_data) = maybe_prefill_data {
            let tenant_vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &su.id)?;
            tenant_vw.prefill_portable_data(conn, prefill_data, actor)?;
        }
    }

    if let Some(wfr) = wfr {
        let results = WorkflowRequestJunction::set_wf_id(conn, &wfr.id, &wf)?;
        if results.is_empty() {
            tracing::error!(wfr_id=%wfr.id, wf_id=%wf.id, "Expected to set workflow ID for WorkflowRequest but did not");
        }
    }

    if is_new_wf {
        let wf = Workflow::get(conn, &wf.id)?;
        let document_types_and_countries = obc.document_types_and_countries.clone();
        let user_doc_requests = match &wf.config {
            WorkflowConfig::Kyc(_) | WorkflowConfig::AlpacaKyc(_) => chain!(
                // Identity documents are generally still represented in CDOs. We could migrate them
                // to `obc.documents_to_collect` one day
                obc.document_cdo().map(|cdo| DocumentRequestConfig::Identity {
                    collect_selfie: cdo.selfie() == Selfie::RequireSelfie,
                    document_types_and_countries,
                }),
                obc.documents_to_collect.clone().unwrap_or_default(),
            )
            .collect(),
            WorkflowConfig::Document(DocumentConfig { configs, .. }) => configs.clone(),
            WorkflowConfig::Kyb(_) => {
                vec![]
            }
        };
        create_doc_requests(conn, &user_doc_requests, &wf)?;
    }
    Ok((wf, is_new_wf))
}

pub struct CreateBusinessWfArgs<'a> {
    pub user_auth: &'a UserSessionContext,
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub inherit_business_id: InheritBusinessId,
}

pub enum InheritBusinessId {
    /// If `force_create` is true, make a new business. Otherwise, inherit the most recently
    /// completed business.
    Legacy,
    /// Inherit the provided business, otherwise create a new business
    Modern(Option<BoId>),
}

fn get_or_create_business(
    conn: &mut TxnPgConn,
    user_auth: &UserSessionContext,
    obc: &ObConfiguration,
    inherit_business_id: InheritBusinessId,
    new_biz_keypair: VaultKeyPair,
    force_create: bool,
) -> FpResult<ScopedVaultId> {
    if let Some(sb_id) = user_auth.sb_id.clone() {
        // A scoped business has been attached to this session already. This happens in secondary beneficial
        // owner tokens or in user-specific sessions with an `fp_bid`
        if matches!(inherit_business_id, InheritBusinessId::Modern(Some(_))) {
            return ValidationError("Cannot provide business ID when a scoped business is already attached")
                .into();
        }
        return Ok(sb_id);
    }

    if user_auth.is_secondary_bo() {
        return AssertionError("Secondary BO should already have associated business").into();
    }

    let uv_id = &user_auth.user.id;
    match inherit_business_id {
        InheritBusinessId::Legacy => {
            // TODO: deprecate this codepath
            let existing_businesses =
                (!force_create).then_some(BusinessOwner::list_owned_businesses(conn, uv_id, &obc.id)?);
            if let Some((_, sb, _)) = existing_businesses.into_iter().flatten().next() {
                // If the user has already started onboarding their business onto this exact ob config AND we
                // aren't force creating a new workflow (which should also support force
                // creating a new business), we should locate the existing business.
                // This supports inheriting in-progress business onboaridngs and short-circuiting when a user
                // has already onboarded onto a playbook.
                return Ok(sb.id);
            }
        }
        InheritBusinessId::Modern(Some(inherit_business_id)) => {
            // The user has selected an existing business from the list of owned businesses
            let id = ScopedVaultIdentifier::OwnedBusiness {
                bo_id: &inherit_business_id,
                uv_id,
                t_id: &obc.tenant_id,
            };
            let sb = ScopedVault::get(conn, id).optional()?.ok_or(ValidationError(
                "Could not find the requested business owned by the user.",
            ))?;
            return Ok(sb.id);
        }
        InheritBusinessId::Modern(None) => {}
    }

    // Otherwise, make a new business vault and scoped vault owned by the currently authed user
    let (public_key, e_private_key) = new_biz_keypair;
    let args = NewVaultArgs {
        public_key,
        e_private_key,
        is_live: user_auth.user.is_live,
        kind: VaultKind::Business,
        is_fixture: false,
        sandbox_id: user_auth.user.sandbox_id.clone(), // Use the same sandbox ID for business vault
        is_created_via_api: false,
        duplicate_of_id: None,
    };
    let business_vault = Vault::create(conn, args)?;
    BusinessOwner::create_primary(conn, user_auth.user.id.clone(), business_vault.id.clone())?;
    let (sb, _) = ScopedVault::get_or_create_for_playbook(conn, &business_vault, obc.id.clone())?;
    Ok(sb.id)
}

#[tracing::instrument("get_or_create_business_wf", skip_all)]
pub fn get_or_create_business_wf<'a>(
    conn: &'a mut TxnPgConn,
    common_args: CommonWfArgs,
    kp: VaultKeyPair,
    args: CreateBusinessWfArgs<'a>,
) -> FpResult<(Workflow, IsNew)> {
    let CommonWfArgs {
        obc,
        insight_event,
        source,
        wfr,
        force_create,
        su,
    } = common_args;
    let CreateBusinessWfArgs {
        user_auth,
        fixture_result,
        inherit_business_id,
    } = args;

    let sb_id = user_auth.sb_id.as_ref();
    let wfr_junction = sb_id
        .zip(wfr.as_ref())
        .map(|(sb_id, wfr)| WorkflowRequestJunction::get(conn, &wfr.id, sb_id))
        .transpose()?;
    if let Some(wf_id) = wfr_junction.and_then(|wfr| wfr.workflow_id) {
        // This request has already been used to make a Workflow. Return that workflow.
        let wf = Workflow::get(conn, &wf_id)?;
        return Ok((wf, false));
    }

    if let Some(biz_wf_id) = user_auth.biz_wf_id.as_ref() {
        // Either a duplicate call to `POST /hosted/onboarding`, or we're using a secondary beneficial owner
        // token and the business has already been created
        let biz_wf = Workflow::get(conn, biz_wf_id)?;
        return Ok((biz_wf, false));
    };

    if obc.kind != ObConfigurationKind::Kyb {
        return ValidationError("Cannot onboard a business to a non-KYB playbook").into();
    }

    Vault::lock(conn, &su.vault_id)?;
    let sb_id = get_or_create_business(conn, user_auth, obc, inherit_business_id, kp, force_create)?;
    ScopedVault::lock(conn, &sb_id)?;


    //
    // Get or create a new business workflow
    //

    let ob_create_args = OnboardingWorkflowArgs {
        scoped_vault_id: sb_id,
        ob_configuration_id: obc.id.clone(),
        authorized: true,
        insight_event,
        source,
        fixture_result,
        is_one_click: false,
        wfr,
        is_neuro_enabled: false, // not now
    };
    let (biz_wf, is_new_wf) = Workflow::get_or_create_onboarding(conn, ob_create_args, force_create)?;

    if is_new_wf {
        // Create the business document requests
        let biz_doc_requests = match &biz_wf.config {
            WorkflowConfig::Document(DocumentConfig { business_configs, .. }) => business_configs.as_slice(),
            WorkflowConfig::Kyb(_) => &obc.business_documents_to_collect,
            _ => &[],
        };
        create_doc_requests(conn, biz_doc_requests, &biz_wf)?;

        // If we're reusing existing BO KYC, link the previous workflows for this BO to the new business
        // workflow
        let reuse_existing_bo_kyc = match &biz_wf.config {
            WorkflowConfig::Kyb(KybConfig {
                reuse_existing_bo_kyc,
                ..
            }) => *reuse_existing_bo_kyc,
            _ => false,
        };
        if reuse_existing_bo_kyc {
            let sb = ScopedVault::get(conn, &biz_wf.scoped_vault_id)?;
            let latest_wf_per_bo =
                BusinessWorkflowLink::get_latest_complete_per_bo(conn, &sb.vault_id, &obc.id)?;
            // For all of the BOs except the current, link their previous complete workflows for this playbook
            // to the current business workflow.
            // This allows us to not require redoing KYC for the other BOs.
            let new_wfls = latest_wf_per_bo
                .iter()
                .filter(|(_, wf)| wf.scoped_vault_id != su.id)
                .map(|(bo, wf)| NewBusinessWorkflowLinkRow {
                    business_owner_id: &bo.id,
                    business_workflow_id: &biz_wf.id,
                    user_workflow_id: &wf.id,
                    source: BusinessWorkflowLinkSource::Reuse,
                })
                .collect();
            BusinessWorkflowLink::bulk_create(conn, new_wfls)?;
        }
    }

    if let Some(wfr) = wfr {
        // Explicitly do not enforce that a WFR junction was updated. It's possible we just created a new
        // business here
        WorkflowRequestJunction::set_wf_id(conn, &wfr.id, &biz_wf)?;
    }

    Ok((biz_wf, is_new_wf))
}

pub fn create_biz_wfl(conn: &mut TxnPgConn, biz_wf: &Workflow, user_wf: &Workflow) -> FpResult<()> {
    let sb = ScopedVault::get(conn, &biz_wf.scoped_vault_id)?;
    let su = ScopedVault::get(conn, &user_wf.scoped_vault_id)?;
    if sb.kind != VaultKind::Business || su.kind != VaultKind::Person {
        return AssertionError("Invalid scoped vaults for business workflow link").into();
    }

    let bo_id = BoIdentifier::Vaults {
        uv_id: &su.vault_id,
        bv_id: &sb.vault_id,
    };
    let bo = BusinessOwner::get(conn, bo_id)?;
    let new = NewBusinessWorkflowLinkRow {
        business_owner_id: &bo.id,
        business_workflow_id: &biz_wf.id,
        user_workflow_id: &user_wf.id,
        source: BusinessWorkflowLinkSource::Hosted,
    };
    BusinessWorkflowLink::bulk_create(conn, vec![new])?;
    Ok(())
}

fn create_doc_requests(
    conn: &mut TxnPgConn,
    configs: &[DocumentRequestConfig],
    wf: &Workflow,
) -> FpResult<()> {
    if configs.is_empty() {
        return Ok(());
    }
    let doc_requests_to_create = configs
        .iter()
        .cloned()
        .map(|config| NewDocumentRequestArgs {
            scoped_vault_id: wf.scoped_vault_id.clone(),
            workflow_id: wf.id.clone(),
            rule_set_result_id: None,
            config,
        })
        .collect_vec();
    DocumentRequest::bulk_create(conn, doc_requests_to_create)?;
    Ok(())
}
