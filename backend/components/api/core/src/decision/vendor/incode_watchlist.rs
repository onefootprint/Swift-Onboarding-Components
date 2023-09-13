use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::RequestAndMaybeResult;
use db::models::{verification_request::VerificationRequest, verification_result::VerificationResult};
use db::DbPool;
use either::Either;
use feature_flag::BoolFlag;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::incode::APIResponseToIncodeError;
use idv::incode::{
    response::OnboardingStartResponse, watchlist::IncodeWatchlistCheckRequest, IncodeResponse,
    IncodeStartOnboardingRequest,
};
use idv::{ParsedResponse, VendorResponse};
use newtypes::{
    vendor_credentials::IncodeCredentialsWithToken, DecisionIntentId, IdvData, IncodeConfigurationId,
    ScopedVaultId, VendorAPI,
};
use newtypes::{
    EncryptedVaultPrivateKey, ObConfigurationKey, PiiJsonValue, VaultPublicKey, VerificationRequestId,
    VerificationResultId, WorkflowId,
};

use super::vendor_api::vendor_api_response::build_vendor_response_map_from_vendor_results;
use super::vendor_api::vendor_api_struct::IncodeWatchlistCheck;
use super::vendor_result::VendorResult;
use super::verification_result;
use super::{build_request, tenant_vendor_control::TenantVendorControl};
use crate::enclave_client::EnclaveClient;
use crate::utils::vault_wrapper::{Any, VaultWrapper, VwArgs};
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
        credentials: tvc.incode_credentials(false),
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
        credentials: tvc.incode_credentials(false),
        authentication_token: token,
    };

    let res = call_watchlist_result(state, incode_credentials, sv_id, di_id, user_vault_public_key).await?;
    Ok(res)
}

// TODO: code share/new abstraction to consolidate this with run_kyc_vendor_calls
pub async fn run_watchlist_check(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
) -> ApiResult<(VerificationResultId, WatchlistResultResponse)> {
    let svid = di.scoped_vault_id.clone();
    let diid = di.id.clone();
    let wf_id = wf_id.clone();
    let (latest_results, tenant_id, vw, obc_key) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;

            let latest_results =
                VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, &diid)?;

            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;

            let ob_configuration_key: ObConfigurationKey = ObConfiguration::get(conn, &wf_id)?.0.key;

            Ok((latest_results, sv.tenant_id, vw, ob_configuration_key))
        })
        .await??;

    // Check if a successful result already exists and idempotently return that if so
    let existing_res =
        existing_watchlist_check_response(&state.enclave_client, &vw.vault.e_private_key, latest_results)
            .await?;
    if let Some(existing_res) = existing_res {
        return Ok(existing_res);
    }

    let tvc =
        TenantVendorControl::new(tenant_id, &state.db_pool, &state.config, &state.enclave_client).await?;

    // dont make real call if non-Prod, unless specifically FF'd to do so
    if state.config.service_config.is_production()
        || state
            .feature_flag_client
            .flag(BoolFlag::EnableIncodeWatchlistCheckInNonProd(&obc_key))
    {
        make_watchlist_result_call(state, &tvc, &di.scoped_vault_id, &di.id, &vw.vault.public_key)
            .await
            .map(|(vr, wr)| (vr.id, wr)) //we return vres.id instead of vres just because we currently only get vres_id from our VendorAPIResponseIdentifiersMap
    } else {
        save_canned_response(
            state,
            di.scoped_vault_id.clone(),
            di.id.clone(),
            vw.vault.public_key.clone(),
        )
        .await
    }
}

async fn existing_watchlist_check_response(
    enclave_client: &EnclaveClient,
    vault_private_key: &EncryptedVaultPrivateKey,
    latest_results: Vec<RequestAndMaybeResult>,
) -> ApiResult<Option<(VerificationResultId, WatchlistResultResponse)>> {
    let latest_results =
        VendorResult::hydrate_vendor_results(latest_results, enclave_client, vault_private_key).await?;

    let vendor_results: Vec<VendorResult> = latest_results
        .into_iter()
        .flat_map(|r| r.into_vendor_result())
        .collect();

    let (vres_map, vres_ids_map) = build_vendor_response_map_from_vendor_results(&vendor_results)?;

    if let (Some(wr), Some(ids)) = (
        vres_map.get(&IncodeWatchlistCheck),
        vres_ids_map.get(&IncodeWatchlistCheck),
    ) {
        Ok(Some((ids.verification_result_id.clone(), wr.clone())))
    } else {
        Ok(None)
    }
}

async fn save_canned_response(
    state: &State,
    sv_id: ScopedVaultId,
    di_id: DecisionIntentId,
    public_key: VaultPublicKey,
) -> ApiResult<(VerificationResultId, WatchlistResultResponse)> {
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let canned_res = idv::test_fixtures::incode_watchlist_result_response_no_hits();
            let parsed = serde_json::from_value::<WatchlistResultResponse>(canned_res.clone())?;

            let (_vreq, vres) = verification_result::save_vreq_and_vres(
                conn,
                &public_key,
                &sv_id,
                &di_id,
                Ok(VendorResponse {
                    raw_response: PiiJsonValue::new(serde_json::to_value(&canned_res)?),
                    response: ParsedResponse::IncodeWatchlistCheck(parsed.clone()),
                }),
            )?;
            Ok((vres.id, parsed))
        })
        .await
}
