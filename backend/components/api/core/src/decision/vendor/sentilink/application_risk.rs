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
use api_errors::FpDbOptionalExtension;
use db::models::billing_event::BillingEvent;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::insight_event::InsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VReqIdentifier;
use db::models::workflow::Workflow;
use idv::sentilink::application_risk::request::AppRiskMetadata;
use idv::sentilink::application_risk::response::ValidatedApplicationRiskResponse;
use idv::sentilink::SentilinkApplicationRiskRequest;
use newtypes::sentilink::SentilinkProduct;
use newtypes::BillingEventKind;
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
    let wf_id2 = wf_id.clone();

    let (vw, tenant_id, curr_seqno, ie, fp_id, obc_id) = state
        .db_transaction(move |conn| {
            let sv = ScopedVault::get(conn, &svid)?;
            let tenant_id = sv.tenant_id.clone();
            let ie = InsightEvent::get(conn, &wf_id2).optional()?;
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            // TODO: Fix this to read from DI
            // https://linear.app/footprint/issue/BE-1582/add-seqno-to-di
            // We want to freeze the moment we are going to verify someone, and then use
            // that to reconstruct the vault. For now in testing it doesn't matter
            let curr_seqno = DataLifetime::get_current_seqno(conn)?;
            let wf = Workflow::get(conn, &wf_id2)?;

            Ok((vw, tenant_id, curr_seqno, ie, sv.fp_id, wf.ob_configuration_id))
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

    let metadata = AppRiskMetadata {
        ob_configuration_id: Some(obc_id),
    };

    let request = SentilinkApplicationRiskRequest {
        idv_data,
        credentials: tvc
            .sentilink_credentials()
            .try_into_tenant_specific_credentials()?,
        // TODO: from verification check?
        products: vec![SentilinkProduct::SyntheticScore, SentilinkProduct::IdTheftScore],
        workflow_id: wf_id.clone(),
        // Currently from the wf creation IE event
        ip_address: ie.and_then(|i| i.ip_address.map(|ip| ip.into())),
        fp_id,
        metadata: Some(metadata),
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

    // Save billing event
    let sv_id = di.scoped_vault_id.clone();
    let wf_id3 = wf_id.clone();
    state
        .db_pool
        .db_transaction(move |conn| {
            let (obc, _) = ObConfiguration::get(conn, &wf_id3)?;
            BillingEvent::create(conn, &sv_id, Some(&obc.id), BillingEventKind::SentilinkScore)?;

            Ok(())
        })
        .await?;

    Ok(Some((validated, vres_id)))
}
