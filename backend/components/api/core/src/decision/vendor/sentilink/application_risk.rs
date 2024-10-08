use crate::decision::vendor::build_request::build_idv_data_at;
use crate::decision::vendor::into_fp_error;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use crate::State;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VReqIdentifier;
use idv::sentilink::application_risk::response::ValidatedApplicationRiskResponse;
use idv::sentilink::SentilinkApplicationRiskRequest;
use newtypes::sentilink::SentilinkProduct;
use newtypes::SentilinkApplicationRisk;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use newtypes::WorkflowId;


#[tracing::instrument(skip_all)]
pub async fn run_sentilink_application_risk(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
) -> FpResult<Option<(ValidatedApplicationRiskResponse, VerificationResultId)>> {
    let svid = di.scoped_vault_id.clone();

    let (vw, tenant_id, curr_seqno) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;
            let tenant_id = sv.tenant_id.clone();
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            // TODO: Fix this to read from DI
            // https://linear.app/footprint/issue/BE-1582/add-seqno-to-di
            // We want to freeze the moment we are going to verify someone, and then use
            // that to reconstruct the vault. For now in testing it doesn't matter
            let curr_seqno = DataLifetime::get_current_seqno(conn)?;

            Ok((vw, tenant_id, curr_seqno))
        })
        .await?;

    // check if we've already ran the request and have a response
    let existing_result = load_response_for_vendor_api(
        state,
        VReqIdentifier::WfId(wf_id.clone()),
        &vw.vault.e_private_key,
        SentilinkApplicationRisk,
    )
    .await?
    .ok();

    if existing_result.is_some() {
        return Ok(None);
    }

    // Make the call
    let tvc = TenantVendorControl::new(
        tenant_id.clone(),
        &state.db_pool,
        &state.config,
        &state.enclave_client,
    )
    .await?;

    let idv_data = build_idv_data_at(
        &state.db_pool,
        &state.enclave_client,
        &di.scoped_vault_id,
        curr_seqno,
    )
    .await?;

    let request = SentilinkApplicationRiskRequest {
        idv_data,
        credentials: tvc
            .sentilink_credentials()
            .try_into_tenant_specific_credentials()?,
        // TODO: from verification check?
        products: vec![SentilinkProduct::SyntheticScore, SentilinkProduct::IdTheftScore],
    };

    // make request
    let res = state
        .vendor_clients
        .sentilink
        .sentilink_application_risk
        .make_request(request)
        .await;

    // save
    let args = SaveVerificationResultArgs::new_for_sentilink(
        &res,
        di.id.clone(),
        di.scoped_vault_id.clone(),
        vw.vault.public_key.clone(),
        VendorAPI::SentilinkApplicationRisk,
    );

    let (vres_id, _) = args.save(&state.db_pool).await?;

    let resp = res
        .map_err(into_fp_error)?
        .result
        .into_success()
        .map_err(into_fp_error)?;

    let validated = resp.validate().map_err(into_fp_error)?;

    Ok(Some((validated, vres_id)))
}
