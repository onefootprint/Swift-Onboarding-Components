use db::{
    models::{
        billing_event::BillingEvent,
        decision_intent::DecisionIntent,
        ob_configuration::ObConfiguration,
        scoped_vault::ScopedVault,
        verification_request::{RequestAndMaybeResult, VerificationRequest},
        verification_result::VerificationResult,
    },
    DbPool,
};
use either::Either;
use feature_flag::BoolFlag;
use idv::{
    incode::{
        response::OnboardingStartResponse,
        watchlist::{
            response::WatchlistResultResponse, IncodeUpdatedWatchlistResultRequest,
            IncodeWatchlistCheckRequest,
        },
        IncodeClientErrorCustomFailureReasons, IncodeResponse, IncodeStartOnboardingRequest,
    },
    ParsedResponse, VendorResponse,
};
use newtypes::{
    vendor_credentials::IncodeCredentialsWithToken, BillingEventKind::ContinuousMonitoringPerYear,
    DecisionIntentId, EncryptedVaultPrivateKey, IdvData, IncodeConfigurationId, IncodeEnvironment,
    IncodeWatchlistResultRef, ObConfigurationKey, PiiJsonValue, ScopedVaultId, VaultPublicKey, VendorAPI,
    VerificationRequestId, VerificationResultId,
};

use super::{
    build_request,
    tenant_vendor_control::TenantVendorControl,
    vendor_api::{
        vendor_api_response::build_vendor_response_map_from_vendor_results,
        vendor_api_struct::{IncodeUpdatedWatchlistResult, IncodeWatchlistCheck},
    },
    vendor_result::VendorResult,
    verification_result,
};
use crate::{
    enclave_client::EnclaveClient,
    errors::ApiResult,
    utils::vault_wrapper::{Any, VaultWrapper, VwArgs},
    ApiError, State,
};

// TODO: similar to what incode state machine does, would be nice to code share more here
#[tracing::instrument(skip(db_pool, res, user_vault_public_key, api_or_vreq_id))]
async fn save_vres_and_maybe_vreq<T: IncodeClientErrorCustomFailureReasons + serde::Serialize>(
    db_pool: &DbPool,
    res: &IncodeResponse<T>,
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
        .unwrap_or(serde_json::json!({}).into());

    let e_response =
        verification_result::encrypt_verification_result_response(&raw_response, user_vault_public_key)?;

    let sv_id = sv_id.clone();
    let di_id = di_id.clone();
    let vres = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let vreq_id = match api_or_vreq_id {
                Either::Left(vendor_api) => {
                    let vreq = VerificationRequest::create(conn, (&sv_id, &di_id, vendor_api).into())?;
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

#[tracing::instrument(skip(state, user_vault_public_key, tvc))]
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
        credentials: tvc.incode_credentials(IncodeEnvironment::Production),
        configuration_id: IncodeConfigurationId::from("65023dbdc221a0aba52791be".to_string()), // TODO: upstream this somewhere based on OBC, maybe not even necessary for watchlist
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
        &res,
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

#[tracing::instrument(skip(state, user_vault_public_key, credentials))]
async fn call_watchlist_result(
    state: &State,
    credentials: IncodeCredentialsWithToken,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey,
    kind: WatchlistCheckKind,
) -> ApiResult<(VerificationResult, WatchlistResultResponse)> {
    let svid = sv_id.clone();
    let diid = di_id.clone();
    let vendor_api: VendorAPI = kind.clone().into();
    let vreq = state
        .db_pool
        .db_query(move |conn| VerificationRequest::create(conn, (&svid, &diid, vendor_api).into()))
        .await?;
    let vreq_id = vreq.id.clone();

    // TODO: we're moving towards a paradigm where we write the Vreq + Vres at the same time after making the call, but build_idv_data
    // still requires a vreq so here we are splitting the saving on vreq + vres. Could refactor build_idv_data to just take a seqno?
    let idv_data: IdvData =
        build_request::build_idv_data_from_verification_request(&state.db_pool, &state.enclave_client, vreq)
            .await?;

    let (vres, res) = match kind {
        WatchlistCheckKind::MakeNewSearch => {
            let res = state
                .vendor_clients
                .incode
                .incode_watchlist_check
                .make_request(IncodeWatchlistCheckRequest {
                    credentials,
                    idv_data,
                })
                .await
                .map_err(|e| ApiError::from(idv::Error::from(e)))?;
            let vres = save_vres_and_maybe_vreq(
                &state.db_pool,
                &res,
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
            (vres, res)
        }

        WatchlistCheckKind::GetUpdatedResults(ref_) => {
            let res = state
                .vendor_clients
                .incode
                .incode_updated_watchlist_result
                .make_request(IncodeUpdatedWatchlistResultRequest {
                    credentials,
                    ref_: ref_.clone(),
                })
                .await
                .map_err(|e| ApiError::from(idv::Error::from(e)))?;
            let vres = save_vres_and_maybe_vreq(
                &state.db_pool,
                &res,
                sv_id,
                di_id,
                user_vault_public_key,
                Either::Right(vreq_id),
            )
            .await?;
            let res = res
                .result
                .into_success()
                .map_err(|e| ApiError::from(idv::Error::from(e)))?
                .0;
            (vres, res)
        }
    };

    Ok((vres, res))
}

#[tracing::instrument(skip(state, tvc, user_vault_public_key))]
pub async fn make_watchlist_result_call(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey,
    kind: WatchlistCheckKind,
) -> ApiResult<(VerificationResult, WatchlistResultResponse)> {
    let res = call_start_onboarding(state, tvc, sv_id, di_id, user_vault_public_key).await?;

    let token = res.token;
    let incode_credentials = IncodeCredentialsWithToken {
        credentials: tvc.incode_credentials(IncodeEnvironment::Production),
        authentication_token: token,
    };

    let res = call_watchlist_result(
        state,
        incode_credentials,
        sv_id,
        di_id,
        user_vault_public_key,
        kind,
    )
    .await?;
    Ok(res)
}

#[derive(Debug, Clone)]
pub enum WatchlistCheckKind {
    MakeNewSearch,
    GetUpdatedResults(IncodeWatchlistResultRef),
}

impl From<WatchlistCheckKind> for VendorAPI {
    fn from(value: WatchlistCheckKind) -> Self {
        match value {
            WatchlistCheckKind::MakeNewSearch => VendorAPI::IncodeWatchlistCheck,
            WatchlistCheckKind::GetUpdatedResults(_) => VendorAPI::IncodeUpdatedWatchlistResult,
        }
    }
}

// TODO: code share/new abstraction to consolidate this with run_kyc_vendor_calls
#[tracing::instrument(skip(state))]
pub async fn run_watchlist_check(
    state: &State,
    di: &DecisionIntent,
    obc_key: &ObConfigurationKey,
    kind: WatchlistCheckKind,
) -> ApiResult<(VerificationResultId, WatchlistResultResponse)> {
    let svid = di.scoped_vault_id.clone();
    let diid = di.id.clone();
    let obc_key = obc_key.clone();
    let (latest_results, tenant_id, vw, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;

            let latest_results =
                VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, &diid)?;

            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;

            let (obc, _) = ObConfiguration::get(conn, &obc_key)?;

            // Create a BillingEvent once per year for this user
            BillingEvent::create(conn, sv.id.clone(), obc.id.clone(), ContinuousMonitoringPerYear)?;

            Ok((latest_results, sv.tenant_id, vw, obc))
        })
        .await?;

    // Check if a successful result already exists and idempotently return that if so
    let existing_res = existing_watchlist_check_response(
        &state.enclave_client,
        &vw.vault.e_private_key,
        latest_results,
        kind.clone(),
    )
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
            .flag(BoolFlag::EnableIncodeWatchlistCheckInNonProd(&obc.key))
    {
        make_watchlist_result_call(
            state,
            &tvc,
            &di.scoped_vault_id,
            &di.id,
            &vw.vault.public_key,
            kind,
        )
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
    kind: WatchlistCheckKind,
) -> ApiResult<Option<(VerificationResultId, WatchlistResultResponse)>> {
    let latest_results =
        VendorResult::hydrate_vendor_results(latest_results, enclave_client, vault_private_key).await?;

    let vendor_results: Vec<VendorResult> = latest_results
        .into_iter()
        .flat_map(|r| r.into_vendor_result())
        .collect();

    let (vres_map, vres_ids_map) = build_vendor_response_map_from_vendor_results(&vendor_results)?;

    let (wr, ids) = match kind {
        WatchlistCheckKind::MakeNewSearch => (
            vres_map.get(&IncodeWatchlistCheck),
            vres_ids_map.get(&IncodeWatchlistCheck),
        ),
        WatchlistCheckKind::GetUpdatedResults(_) => (
            vres_map.get(&IncodeUpdatedWatchlistResult).map(|u| &u.0),
            vres_ids_map.get(&IncodeUpdatedWatchlistResult),
        ),
    };

    if let (Some(wr), Some(ids)) = (wr, ids) {
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
