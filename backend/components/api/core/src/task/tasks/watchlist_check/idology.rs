use crate::{
    decision::{
        vendor::{
            tenant_vendor_control::TenantVendorControl,
            vendor_api::{
                vendor_api_response::{VendorAPIResponseIdentifiersMap, VendorAPIResponseMap},
                vendor_api_struct::IdologyPa,
            },
            vendor_trait::VendorAPIResponse,
            verification_result, VendorAPIError,
        },
        {self},
    },
    errors::ApiResult,
    ApiError, State,
};
use db::models::{
    risk_signal::NewRiskSignalInfo, vault::Vault, verification_request::VerificationRequest,
    verification_result::VerificationResult,
};
use idv::{
    idology::{
        expectid::response::PaWatchlistHit,
        pa::{response::PaResponse, IdologyPaAPIResponse},
    },
    VendorResponse,
};
use newtypes::{DecisionIntentId, FootprintReasonCode, ScopedVaultId, TenantId, VendorAPI};

pub async fn complete_vendor_call(
    state: &State,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    tenant_id: &TenantId,
    existing_vendor_results: (VendorAPIResponseMap, VendorAPIResponseIdentifiersMap),
) -> ApiResult<Vec<NewRiskSignalInfo>> {
    let (res_map, ids_map) = existing_vendor_results;
    let (reason_codes, vres_id) =
        if let (Some(res), Some(ids)) = (res_map.get(&IdologyPa), ids_map.get(&IdologyPa)) {
            // we already successfully completed a IdologyPa call for this watchlist task, so just return reason codes from it
            (
                parse_reason_codes(res.clone())?,
                ids.verification_result_id.clone(),
            )
        } else {
            let (res, vres) = make_vendor_call(state, sv_id, di_id, tenant_id).await?;
            let pa_res = PaResponse::try_from(res.response)?;
            (parse_reason_codes(pa_res)?, vres.id)
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
) -> ApiResult<(VendorResponse, VerificationResult)> {
    // TODO: consolidate this with make_idv_vendor_call_save_vreq_vres
    let vendor_api = VendorAPI::IdologyPa;
    let svid = sv_id.clone();
    let diid = di_id.clone();
    let vreq = state
        .db_pool
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

    let res: Result<IdologyPaAPIResponse, idv::idology::error::Error> = state
        .vendor_clients
        .idology_pa
        .make_request(tvc.build_idology_pa_request(idv_data))
        .await;

    let res = res
        .map(|r| {
            let parsed_response = r.parsed_response();
            let raw_response = r.raw_response();
            VendorResponse {
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| e.into())
        .map_err(|e| VendorAPIError { vendor_api, error: e });

    let svid = sv_id.clone();
    let (res, vres) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uv = Vault::get(conn, &svid)?;
            let vres = verification_result::save_vres(conn, &uv.public_key, &res, &vreq)?;
            Ok((res, vres))
        })
        .await?;

    Ok((res?, vres))
}

fn parse_reason_codes(res: PaResponse) -> ApiResult<Vec<FootprintReasonCode>> {
    if let Some(restriction) = res.response.restriction {
        Ok(PaWatchlistHit::to_footprint_reason_codes(
            restriction.watchlists(),
        ))
    } else {
        // TODO: we really should have .validate() on the raw response validate stuff like this and transform it into a struct without Option's
        Err(ApiError::from(idv::Error::from(
            idv::idology::error::Error::MissingRestrictionField,
        )))
    }
}
