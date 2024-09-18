use crate::types::ApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_core::auth::user::UserAuthScope;
use api_core::auth::user::UserWfAuthContext;
use api_core::utils::headers::BootstrapFieldsHeader;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::DataRequestSource;
use api_core::utils::vault_wrapper::DlSourceWithOverrides;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::VwArgs;
use db::models::document_request::DocumentRequest;
use db::models::document_request::NewDocumentRequestArgs;
use db::models::ob_configuration::ObConfiguration;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::put_data_request::RawUserDataRequest;
use newtypes::DataLifetimeSource;
use newtypes::DocumentRequestConfig;
use newtypes::IdentityDataKind as IDK;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::ScopedVaultId;
use newtypes::ValidateArgs;
use newtypes::WorkflowGuard;
use newtypes::WorkflowId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use std::str::FromStr;

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the vault",
    tags(Vault, Hosted, Users)
)]
#[actix::post("/hosted/user/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    request: Json<RawUserDataRequest>,
    user_wf_auth: UserWfAuthContext,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_wf_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;

    let opts = ValidateArgs {
        ignore_luhn_validation: false,
        for_bifrost: true,
        is_live: user_auth.user().is_live,
    };
    let PatchDataRequest { updates, .. } = PatchDataRequest::clean_and_validate(request.into_inner(), opts)?;
    // No fingerprints to check speculatively
    let updates = FingerprintedDataRequest::no_fingerprints_for_validation(updates);
    let su_id = user_auth.scoped_user.id.clone();
    let source = user_auth.user_session.dl_source();
    state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let vw = VaultWrapper::<Person>::build_for_tenant(conn, &su_id)?;
            vw.validate_request(conn, updates, &DataRequestSource::HostedPatchVault(source.into()))?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}

#[api_v2_operation(description = "Updates data in a user vault", tags(Vault, Hosted, Users))]
#[actix::patch("/hosted/user/vault")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<RawUserDataRequest>,
    user_wf_auth: UserWfAuthContext,
    bootstrap_fields: BootstrapFieldsHeader,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_wf_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;

    let PatchDataRequest { updates, .. } = PatchDataRequest::clean_and_validate(
        request.into_inner(),
        ValidateArgs::for_bifrost(user_auth.user().is_live),
    )?;
    let residential_address = updates
        .get(&IDK::Country.into())
        .and_then(|a| Iso3166TwoDigitCountryCode::from_str(a.leak()).ok());

    let sv_id = &user_auth.scoped_user.id;
    let updates = FingerprintedDataRequest::build(&state, updates, sv_id).await?;

    let su_id = user_auth.scoped_user.id.clone();
    let source = user_auth.user_session.dl_source();
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su_id)?;

            let overrides = bootstrap_fields
                .0
                .into_iter()
                .map(|di| (di, DataLifetimeSource::LikelyBootstrap))
                .collect();
            let sources = DlSourceWithOverrides {
                default: source,
                overrides,
            };
            // Even though this accepts id.phone_number, it will always error at runtime if we
            // provide id.phone_number since we only allow a vault to have one phone number
            uvw.patch_data(conn, updates, DataRequestSource::HostedPatchVault(sources))?;
            Ok(())
        })
        .await?;

    // TODO these need to be atomic with the patch
    if let Some(address) = residential_address {
        // if we allow international and haven't requested a doc, we need to create a doc req
        let obc = user_auth.ob_config();
        let wf = user_auth.workflow();
        let sv_id = &user_auth.scoped_user.id;
        if obc.allow_international_residents
            && obc.document_cdo().is_none()
            && !address.is_us_including_territories()
        {
            tracing::info!(scoped_vault_id=%sv_id, wf_id=%wf.id, "creating doc request for international onboarding");

            let args = default_identity_doc_args(sv_id, true, &wf.id);
            // TODO: FP-5895 handle 1 click case where address doesn't change (we won't hit this endpoint)
            state
                .db_pool
                .db_transaction(move |conn| DocumentRequest::get_or_create(conn, args))
                .await?;
        } else if address.is_us_including_territories() {
            handle_ssn_skipped(&state, obc.clone(), sv_id.clone(), wf.id.clone()).await?
        }
    }

    Ok(api_wire_types::Empty)
}

// Handle the case where ssn is skipped, we by default request a document if not already requested
async fn handle_ssn_skipped(
    state: &State,
    obc: ObConfiguration,
    sv_id: ScopedVaultId,
    workflow_id: WorkflowId,
) -> FpResult<()> {
    // bail early if not needed
    let Some(doc_info) = obc.document_cdo_for_optional_ssn() else {
        return Ok(());
    };

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let vw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv_id))?;
            let ssn_optional_and_missing = api_core::decision::features::user_input::ssn_optional_and_missing(&vw, &obc);

            if ssn_optional_and_missing {
                let doc_req_args = default_identity_doc_args(&sv_id, doc_info.requires_selfie(), &workflow_id);

                tracing::info!(scoped_vault_id=%sv_id, wf_id=%workflow_id, "creating doc request for ssn skipped");
                DocumentRequest::get_or_create(conn, doc_req_args)?;
            }

            Ok(())
        })
        .await?;

    Ok(())
}

fn default_identity_doc_args(
    sv_id: &ScopedVaultId,
    should_collect_selfie: bool,
    workflow_id: &WorkflowId,
) -> NewDocumentRequestArgs {
    NewDocumentRequestArgs {
        scoped_vault_id: sv_id.clone(),
        workflow_id: workflow_id.clone(),
        rule_set_result_id: None,
        config: DocumentRequestConfig::Identity {
            collect_selfie: should_collect_selfie,
        },
    }
}
