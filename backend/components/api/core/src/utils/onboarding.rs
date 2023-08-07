use db::{
    models::{
        business_owner::BusinessOwner,
        document_request::{DocumentRequest, NewDocumentRequestArgs},
        insight_event::CreateInsightEvent,
        ob_configuration::ObConfiguration,
        onboarding::{IsNew, Onboarding, OnboardingCreateArgs},
        scoped_vault::ScopedVault,
        vault::{NewVaultArgs, Vault},
    },
    TxnPgConn,
};
use newtypes::{
    CollectedDataOption, CountryRestriction, DocTypeRestriction, EncryptedVaultPrivateKey, ScopedVaultId,
    Selfie, VaultId, VaultKind, VaultPublicKey, WorkflowFixtureResult,
};

use crate::errors::{onboarding::OnboardingError, ApiResult};

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
) -> ApiResult<(Onboarding, Option<Onboarding>)> {
    let user_vault = Vault::lock(conn, v_id)?;

    // Create the onboarding for this scoped user
    let ob_create_args = OnboardingCreateArgs {
        scoped_vault_id: sv_id.clone(),
        ob_configuration_id: obc.id.clone(),
        insight_event: insight_event.clone(),
    };

    // TODO rm this when fixture result is passed in process
    let fixture_result = WorkflowFixtureResult::from_sandbox_id(user_vault.sandbox_id.as_ref());
    let (ob, is_new_ob) = Onboarding::get_or_create(conn, ob_create_args, true, fixture_result)?;
    if let IsNew::Yes(ref wf) = is_new_ob {
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
            let wf_id = wf
                .as_ref()
                .map(|wf| wf.id.clone())
                .ok_or(OnboardingError::NoWorkflow)?;
            let doc_type_restriction = if let DocTypeRestriction::Restrict(types) = doc_info.0.clone() {
                Some(types)
            } else {
                None
            };
            let args = NewDocumentRequestArgs {
                scoped_vault_id: ob.scoped_vault_id.clone(),
                ref_id: None,
                workflow_id: wf_id,
                should_collect_selfie: doc_info.2 == Selfie::RequireSelfie,
                only_us: doc_info.1 == CountryRestriction::UsOnly,
                doc_type_restriction,
            };
            DocumentRequest::create(conn, args)?;
        }
    }

    // If the ob config has business fields, create a business vault, scoped vault, and ob
    let biz_ob = if let Some(new_biz_args) = new_biz_args {
        let existing_businesses = BusinessOwner::list_businesses(conn, &user_vault.id, &obc.id)?;
        let biz_ob = if let Some(existing) = existing_businesses.into_iter().next() {
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
            let ob_create_args = OnboardingCreateArgs {
                scoped_vault_id: sb.id,
                ob_configuration_id: obc.id.clone(),
                insight_event,
            };
            let (biz_ob, _) = Onboarding::get_or_create(
                conn,
                ob_create_args,
                new_biz_args.should_create_workflow,
                fixture_result,
            )?;
            biz_ob
        };
        Some(biz_ob)
    } else {
        None
    };

    Ok((ob, biz_ob))
}
