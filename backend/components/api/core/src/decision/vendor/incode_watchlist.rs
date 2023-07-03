use db::models::{verification_request::VerificationRequest, verification_result::VerificationResult};
use db::DbPool;
use either::Either;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::incode::APIResponseToIncodeError;
use idv::incode::{
    response::OnboardingStartResponse, watchlist::IncodeWatchlistCheckRequest, IncodeResponse,
    IncodeStartOnboardingRequest,
};
use newtypes::{
    vendor_credentials::IncodeCredentialsWithToken, DecisionIntentId, IdvData, IncodeConfigurationId,
    ScopedVaultId, VendorAPI,
};
use newtypes::{VaultPublicKey, VerificationRequestId};

use super::verification_result;
use super::{build_request, tenant_vendor_control::TenantVendorControl};
use crate::{errors::ApiResult, ApiError, State};

// TODO: similar to what incode state machine does, would be nice to code share more here
async fn save_vres_and_maybe_vreq<T: APIResponseToIncodeError + serde::Serialize>(
    db_pool: &DbPool,
    res: IncodeResponse<T>,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey,
    api_or_vreq_id: Either<VendorAPI, VerificationRequestId>, // Since for now, the watchlist-result Vreq is written before the vres
) -> ApiResult<VerificationResult> {
    let is_error = res.result.is_error();
    let raw_response = res.raw_response.clone();
    let scrubbed_response = res
        .result
        .scrub()
        .map_err(|e| ApiError::from(idv::Error::from(e)))
        .unwrap_or(serde_json::json!("").into());

    let e_response =
        verification_result::encrypt_verification_result_response(&raw_response, user_vault_public_key)?;

    let sv_id = sv_id.clone();
    let di_id = di_id.clone();
    let vres = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let vreq_id = match api_or_vreq_id {
                Either::Left(vendor_api) => {
                    let vreq = VerificationRequest::create(conn, &sv_id, &di_id, vendor_api)?;
                    vreq.id
                }
                Either::Right(vreq_id) => vreq_id,
            };

            let vres = VerificationResult::create(conn, vreq_id, scrubbed_response, e_response, is_error)?;
            Ok(vres)
        })
        .await?;
    Ok(vres)
}

async fn call_start_onboarding(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey,
) -> ApiResult<OnboardingStartResponse> {
    // TODO: is it kosher to just call /omni/start before we do any watchlist-result call? Or is there a specific reason
    // we need to track `interviewId` / `token` at a user level and re-use?
    let request = IncodeStartOnboardingRequest {
        credentials: tvc.incode_credentials(),
        configuration_id: IncodeConfigurationId::from("646fa9181d194bb841b30b05".to_string()), // TODO: upstream this somewhere based on OBC, maybe not even necessary for watchlist
        session_id: None, // for now we just make a new session everytime we do watchlist-result call to Incode
        custom_name_fields: None, // TODO: this will be dropped from IncodeStartOnboardingRequest altogether. Was originally for doc scan but we decided we don't need even there
    };
    let res = state
        .vendor_clients
        .incode
        .incode_start_onboarding
        .make_request(request)
        .await
        .map_err(|e| ApiError::from(idv::Error::from(e)))?;

    save_vres_and_maybe_vreq(
        &state.db_pool,
        res.clone(),
        sv_id,
        di_id,
        user_vault_public_key,
        Either::Left(VendorAPI::IncodeStartOnboarding),
    )
    .await?;

    let res = res
        .result
        .into_success()
        .map_err(|e| ApiError::from(idv::Error::from(e)))?;
    Ok(res)
}

async fn call_watchlist_result(
    state: &State,
    credentials: IncodeCredentialsWithToken,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey,
) -> ApiResult<(VerificationResult, WatchlistResultResponse)> {
    let svid = sv_id.clone();
    let diid = di_id.clone();
    let vreq = state
        .db_pool
        .db_query(move |conn| {
            VerificationRequest::create(conn, &svid, &diid, VendorAPI::IncodeWatchlistCheck)
        })
        .await??;
    let vreq_id = vreq.id.clone();

    // TODO: we're moving towards a paradigm where we write the Vreq + Vres at the same time after making the call, but build_idv_data
    // still requires a vreq so here we are splitting the saving on vreq + vres. Could refactor build_idv_data to just take a seqno?
    let idv_data: IdvData =
        build_request::build_idv_data_from_verification_request(&state.db_pool, &state.enclave_client, vreq)
            .await?;

    let req = IncodeWatchlistCheckRequest {
        credentials,
        idv_data,
    };

    let res = state
        .vendor_clients
        .incode
        .incode_watchlist_check
        .make_request(req)
        .await
        .map_err(|e| ApiError::from(idv::Error::from(e)))?;

    let vres = save_vres_and_maybe_vreq(
        &state.db_pool,
        res.clone(),
        sv_id,
        di_id,
        user_vault_public_key,
        Either::Right(vreq_id),
    )
    .await?;

    let res = res
        .result
        .into_success()
        .map_err(|e| ApiError::from(idv::Error::from(e)))?;
    Ok((vres, res))
}

pub async fn make_watchlist_result_call(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey, // TODO: pass in stuff like this and tvc or query for it on the fly? i never know
) -> ApiResult<(VerificationResult, WatchlistResultResponse)> {
    let res = call_start_onboarding(state, tvc, sv_id, di_id, user_vault_public_key).await?;

    let token = res.token;
    let incode_credentials = IncodeCredentialsWithToken {
        credentials: tvc.incode_credentials(),
        authentication_token: token,
    };

    let res = call_watchlist_result(state, incode_credentials, sv_id, di_id, user_vault_public_key).await?;
    Ok(res)
}
