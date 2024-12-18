use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::decision::vendor::verification_result::ShouldSaveVerificationRequest;
use crate::decision::{
    self,
};
use crate::FpResult;
use crate::State;
use api_errors::FpError;
use db::models::risk_signal::NewRiskSignalInfo;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use idv::idology::expectid::response::PaWatchlistHit;
use idv::idology::pa::response::PaResponse;
use idv::idology::pa::IdologyPaAPIResponse;
use idv::idology::pa::IdologyPaRequest;
use newtypes::DecisionIntentId;
use newtypes::FootprintReasonCode;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;

pub async fn complete_vendor_call(
    state: &State,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    tenant_id: &TenantId,
    existing_response: Option<(PaResponse, VerificationResultId)>,
) -> FpResult<Vec<NewRiskSignalInfo>> {
    let (reason_codes, vres_id) = if let Some((res, vres_id)) = existing_response {
        // we already successfully completed a IdologyPa call for this watchlist task, so just return reason
        // codes from it
        (parse_reason_codes(res.clone())?, vres_id)
    } else {
        let (res, vres_id) = make_vendor_call(state, sv_id, di_id, tenant_id).await?;
        let pa_res = res.parsed.map_err(idv::Error::from)?;
        (parse_reason_codes(pa_res)?, vres_id)
    };

    Ok(reason_codes
        .into_iter()
        .map(|r| (r, VendorAPI::IdologyPa, vres_id.clone()))
        .collect())
}

async fn make_vendor_call(
    state: &State,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    tenant_id: &TenantId,
) -> FpResult<(IdologyPaAPIResponse, VerificationResultId)> {
    // TODO: consolidate this with make_idv_vendor_call_save_vreq_vres
    let vendor_api = VendorAPI::IdologyPa;
    let svid = sv_id.clone();
    let diid = di_id.clone();
    let vreq = state
        .db_query(move |conn| VerificationRequest::create(conn, (&svid, &diid, vendor_api).into()))
        .await?;
    let idv_data = decision::vendor::build_request::build_idv_data_from_verification_request(
        &state.db_pool,
        &state.enclave_client,
        vreq.clone(),
    )
    .await?;

    let tvc = TenantVendorControl::new(
        tenant_id.clone(),
        &state.db_pool,
        &state.config,
        &state.enclave_client,
    )
    .await?;

    let req = IdologyPaRequest {
        idv_data,
        credentials: tvc.idology_credentials(),
        tenant_identifier: tvc.tenant_identifier(),
    };
    let res = state.vendor_clients.idology_pa.make_request(req).await;
    let svid = sv_id.clone();
    let uv = state.db_query(move |conn| Vault::get(conn, &svid)).await?;
    let vreq = ShouldSaveVerificationRequest::No(vreq.id);
    let args = SaveVerificationResultArgs::new(&res, uv.public_key, vreq);
    let (vres, _) = args.save(&state.db_pool).await?;
    let res = res?;
    Ok((res, vres.id))
}

fn parse_reason_codes(res: PaResponse) -> FpResult<Vec<FootprintReasonCode>> {
    if let Some(restriction) = res.response.restriction {
        Ok(PaWatchlistHit::to_footprint_reason_codes(
            restriction.watchlists(),
        ))
    } else {
        // TODO: we really should have .validate() on the raw response validate stuff like this and
        // transform it into a struct without Option's
        Err(FpError::from(idv::Error::from(
            idv::idology::error::Error::MissingRestrictionField,
        )))
    }
}
