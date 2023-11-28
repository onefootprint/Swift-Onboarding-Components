use super::vault_wrapper::{Any, PrefillData, TenantVw, VaultWrapper, WriteableVw};
use crate::auth::tenant::AuthActor;
use crate::errors::{onboarding::OnboardingError, ApiResult};
use db::{
    models::{
        business_owner::BusinessOwner,
        document_request::{DocumentRequest, NewDocumentRequestArgs},
        insight_event::CreateInsightEvent,
        ob_configuration::ObConfiguration,
        scoped_vault::ScopedVault,
        vault::{NewVaultArgs, Vault},
        workflow::{OnboardingWorkflowArgs, Workflow},
    },
    TxnPgConn,
};
use feature_flag::{BoolFlag, FeatureFlagClient};
use newtypes::{
    CollectedDataOption, EncryptedVaultPrivateKey, ObConfigurationKind, Selfie, VaultKind, VaultPublicKey,
    WorkflowId, WorkflowSource,
};
use std::sync::Arc;

pub struct NewBusinessVaultArgs {
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub should_create_workflow: bool,
}

pub struct NewOnboardingArgs<'a> {
    pub existing_wf_id: Option<WorkflowId>,
    pub force_create: bool,
    pub sv: &'a ScopedVault,
    pub obc: &'a ObConfiguration,
    pub insight_event: Option<CreateInsightEvent>,
    pub new_biz_args: Option<NewBusinessVaultArgs>, // has to be generated async outside the `conn`. We also currently don't support KYB for NPV's but could one day
    pub source: WorkflowSource,
    pub actor: Option<AuthActor>,
    pub maybe_prefill_data: Option<PrefillData>,
}

#[allow(clippy::too_many_arguments)]
pub fn get_or_start_onboarding(
    conn: &mut TxnPgConn,
    ff_client: Arc<dyn FeatureFlagClient>,
    args: NewOnboardingArgs,
) -> ApiResult<(WorkflowId, Option<Workflow>)> {
    let NewOnboardingArgs {
        existing_wf_id,
        force_create,
        sv,
        obc,
        insight_event,
        new_biz_args,
        source,
        actor,
        maybe_prefill_data,
    } = args;
    let user_vault = Vault::lock(conn, &sv.vault_id)?;
    if obc.kind == ObConfigurationKind::Auth {
        return Err(OnboardingError::CannotOnboardOntoAuthPlaybook.into());
    }

    let wf_id = if let Some(wf_id) = existing_wf_id {
        wf_id
    } else {
        let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &sv.id)?;
        let is_one_click = vw.is_one_click();
        // Create the workflow for this scoped user
        let ob_create_args = OnboardingWorkflowArgs {
            scoped_vault_id: sv.id.clone(),
            ob_configuration_id: obc.id.clone(),
            insight_event: insight_event.clone(),
            // If this isn't a one click from another tenant, we can immediately mark the WF as authorized
            authorized: !is_one_click,
            source,
            fixture_result: None,
            is_one_click,
        };
        let (wf, is_new_ob) =
            Workflow::get_or_create_onboarding(conn, ff_client.clone(), ob_create_args, force_create)?;

        if is_new_ob {
            create_doc_request_if_needed(conn, &wf, obc)?;
            let existing_wfs = Workflow::list(conn, &sv.id)?;
            let can_create_prefill_data = ff_client.flag(BoolFlag::SavePrefillData(&sv.tenant_id));
            if can_create_prefill_data && existing_wfs.iter().all(|i| i.id == wf.id) {
                // For the first WF created at this tenant, prefill portable data into this tenant.
                // TODO: the goal is to do this for all WFs in the future. But it's simpler to
                // start with only prefilling data once
                if let Some(prefill_data) = maybe_prefill_data {
                    let tenant_vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &sv.id)?;
                    tenant_vw.prefill_portable_data(conn, prefill_data, actor)?;
                }
                // TODO should we prefill data and use that to determine if one-click happened?
            }
        }
        wf.id
    };

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
            };
            let business_vault = Vault::create(conn, args)?;
            BusinessOwner::create_primary(conn, user_vault.id.clone(), business_vault.id.clone())?;
            let sb = ScopedVault::get_or_create(conn, &business_vault, obc.id.clone())?;
            let ob_create_args = OnboardingWorkflowArgs {
                scoped_vault_id: sb.id,
                ob_configuration_id: obc.id.clone(),
                authorized: true,
                insight_event,
                source,
                fixture_result: None,
                is_one_click: false,
            };
            let (biz_wf, _) = Workflow::get_or_create_onboarding(conn, ff_client, ob_create_args, false)?;
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
    if let Some(doc_info) = obc
        .must_collect_data
        .iter()
        .filter_map(|cdo| match cdo {
            CollectedDataOption::Document(doc_info) => Some(doc_info),
            _ => None,
        })
        .next()
    {
        let args = NewDocumentRequestArgs {
            scoped_vault_id: wf.scoped_vault_id.clone(),
            ref_id: None,
            workflow_id: wf.id.clone(),
            should_collect_selfie: doc_info.selfie() == Selfie::RequireSelfie,
        };
        DocumentRequest::create(conn, args)?;
    }
    Ok(())
}
