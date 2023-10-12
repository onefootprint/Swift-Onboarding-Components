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
use newtypes::{
    CollectedDataOption, CountryRestriction, EncryptedVaultPrivateKey, Iso3166TwoDigitCountryCode,
    ScopedVaultId, Selfie, VaultId, VaultKind, VaultPublicKey, WorkflowFixtureResult,
};

use crate::errors::ApiResult;

use super::vault_wrapper::{Any, TenantVw, VaultWrapper};

pub struct NewBusinessVaultArgs {
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub should_create_workflow: bool,
}

pub fn get_or_start_onboarding(
    conn: &mut TxnPgConn,
    v_id: &VaultId,
    sv_id: &ScopedVaultId,
    obc: &ObConfiguration,
    insight_event: Option<CreateInsightEvent>,
    new_biz_args: Option<NewBusinessVaultArgs>, // has to be generated async outside the `conn`. We also currently don't support KYB for NPV's but could one day
) -> ApiResult<(Workflow, Option<Workflow>)> {
    let user_vault = Vault::lock(conn, v_id)?;

    let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, sv_id)?;
    let is_all_visible_data_added_by_tenant = vw.populated_dis().into_iter().all(|di| {
        let Some(dl) = vw.get_lifetime(di.clone()) else {
            return false; // Shouldn't happen
        };
        // Data must be added by tenant AND already decryptable
        &dl.scoped_vault_id == sv_id && vw.can_decrypt(di)
    });

    // Create the workflow for this scoped user
    let ob_create_args = OnboardingWorkflowArgs {
        scoped_vault_id: sv_id.clone(),
        ob_configuration_id: obc.id.clone(),
        insight_event: insight_event.clone(),
        // If all visible data was added by this tenant, we can immediately mark the Workflow as authorized.
        authorized: is_all_visible_data_added_by_tenant,
    };

    // TODO rm this when fixture result is passed in process
    let fixture_result = WorkflowFixtureResult::from_sandbox_id(user_vault.sandbox_id.as_ref());
    let (wf, is_new_ob) = Workflow::get_or_create_onboarding(conn, ob_create_args, fixture_result)?;
    if is_new_ob {
        create_doc_request_if_needed(conn, &wf, obc)?;
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
                is_portable: true,
                kind: VaultKind::Business,
                is_fixture: false,
                sandbox_id: user_vault.sandbox_id.clone(), // Use the same sandbox ID for business vault
            };
            let business_vault = Vault::create(conn, args)?;
            BusinessOwner::create_primary(conn, user_vault.id.clone(), business_vault.id.clone())?;
            let sb = ScopedVault::get_or_create(conn, &business_vault, obc.id.clone())?;
            let ob_create_args = OnboardingWorkflowArgs {
                scoped_vault_id: sb.id,
                ob_configuration_id: obc.id.clone(),
                authorized: true,
                insight_event,
            };
            let (biz_wf, _) = Workflow::get_or_create_onboarding(conn, ob_create_args, fixture_result)?;
            biz_wf
        };
        Some(biz_wf)
    } else {
        None
    };

    Ok((wf, biz_wf))
}

/// Create a DocumentRequest associated with the provided wf if the obc requires document collection
pub fn create_doc_request_if_needed(
    conn: &mut TxnPgConn,
    wf: &Workflow,
    obc: &ObConfiguration,
) -> ApiResult<()> {
    if let Some(doc_info) = obc
        .must_collect_data
        .iter()
        .filter_map(|cdo| match cdo {
            CollectedDataOption::Document(doc_info) => Some(doc_info),
            _ => None,
        })
        .next()
    {
        // Create a `DocumentRequest` if specified in the ob config.
        // To prevent duplicate document requests, only create a doc request if the onboarding is new
        let doc_type_restriction = doc_info.restricted_id_doc_kinds();

        let args = NewDocumentRequestArgs {
            scoped_vault_id: wf.scoped_vault_id.clone(),
            ref_id: None,
            workflow_id: wf.id.clone(),
            should_collect_selfie: doc_info.selfie() == Selfie::RequireSelfie,
            // TODO: Drop these columns on doc request
            global_doc_types_accepted: doc_type_restriction,
            country_restrictions: vec![(doc_info.country_restriction() == CountryRestriction::UsOnly)
                .then_some(Iso3166TwoDigitCountryCode::US)]
            .into_iter()
            .flatten()
            .collect(),
            country_doc_type_restrictions: None,
        };
        DocumentRequest::create(conn, args)?;
    }
    Ok(())
}
