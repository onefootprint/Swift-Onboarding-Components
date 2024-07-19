use crate::decision::vendor::build_request;
use crate::decision::vendor::incode::common::call_start_onboarding;
use crate::decision::vendor::map_to_api_error;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use crate::decision::vendor::vendor_api::vendor_api_struct::IncodeUpdatedWatchlistResult;
use crate::decision::vendor::vendor_api::vendor_api_struct::IncodeWatchlistCheck;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::decision::vendor::verification_result::ShouldSaveVerificationRequest;
use crate::decision::vendor::verification_result::{
    self,
};
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use crate::State;
use db::models::billing_event::BillingEvent;
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VReqIdentifier;
use db::models::verification_request::VerificationRequest;
use db::DbPool;
use feature_flag::BoolFlag;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::incode::watchlist::IncodeUpdatedWatchlistResultRequest;
use idv::incode::watchlist::IncodeWatchlistCheckRequest;
use idv::incode::IncodeClientErrorCustomFailureReasons;
use idv::incode::IncodeResponse;
use idv::ParsedResponse;
use idv::VendorResponse;
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::BillingEventKind as BEK;
use newtypes::DecisionIntentId;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::EnhancedAmlOption;
use newtypes::IdvData;
use newtypes::IncodeConfigurationId;
use newtypes::IncodeEnvironment;
use newtypes::IncodeWatchlistResultRef;
use newtypes::ObConfigurationKey;
use newtypes::PiiJsonValue;
use newtypes::ScopedVaultId;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;
use newtypes::VerificationRequestId;
use newtypes::VerificationResultId;

// Watchlist check saves Vreq first, so we wrap existing incode utils to just save vreq
// For future us: This is just because we need IdvData, and we create that from
// `build_idv_data_from_verification_request` which requires a Vreq We could just refactor so that
// the fn just takes a seqno, rather than a vreq
#[tracing::instrument(skip(db_pool, res, user_vault_public_key, vreq_id))]
async fn save_verification_result_for_watchlist_check<
    T: IncodeClientErrorCustomFailureReasons + serde::Serialize,
>(
    db_pool: &DbPool,
    res: &Result<IncodeResponse<T>, idv::incode::error::Error>,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey,
    vreq_id: VerificationRequestId,
) -> FpResult<VerificationResultId> {
    let args = SaveVerificationResultArgs::new(
        res,
        di_id.clone(),
        sv_id.clone(),
        None,
        user_vault_public_key.clone(),
        ShouldSaveVerificationRequest::No(vreq_id),
    );

    let (vres_id, _) = args.save(db_pool).await?;

    Ok(vres_id)
}

#[tracing::instrument(skip(state, user_vault_public_key, credentials))]
async fn call_watchlist_result(
    state: &State,
    credentials: IncodeCredentialsWithToken,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey,
    kind: WatchlistCheckKind,
) -> FpResult<(VerificationResultId, WatchlistResultResponse)> {
    let svid = sv_id.clone();
    let diid = di_id.clone();
    let vendor_api: VendorAPI = kind.clone().into();
    let vreq = state
        .db_pool
        .db_query(move |conn| VerificationRequest::create(conn, (&svid, &diid, vendor_api).into()))
        .await?;
    let vreq_id = vreq.id.clone();

    // TODO: we're moving towards a paradigm where we write the Vreq + Vres at the same time after
    // making the call, but build_idv_data still requires a vreq so here we are splitting the saving
    // on vreq + vres. Could refactor build_idv_data to just take a seqno?
    let idv_data: IdvData =
        build_request::build_idv_data_from_verification_request(&state.db_pool, &state.enclave_client, vreq)
            .await?;

    let (vres_id, res) = match kind {
        WatchlistCheckKind::MakeNewSearch => {
            let res = state
                .vendor_clients
                .incode
                .incode_watchlist_check
                .make_request(IncodeWatchlistCheckRequest {
                    credentials,
                    idv_data,
                })
                .await;
            let vres_id = save_verification_result_for_watchlist_check(
                &state.db_pool,
                &res,
                sv_id,
                di_id,
                user_vault_public_key,
                vreq_id,
            )
            .await?;
            let res = res
                .map_err(map_to_api_error)?
                .result
                .into_success()
                .map_err(map_to_api_error)?;
            (vres_id, res)
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
                .await;
            let vres_id = save_verification_result_for_watchlist_check(
                &state.db_pool,
                &res,
                sv_id,
                di_id,
                user_vault_public_key,
                vreq_id,
            )
            .await?;
            let res = res
                .map_err(map_to_api_error)?
                .result
                .into_success()
                .map_err(map_to_api_error)?
                .0;
            (vres_id, res)
        }
    };

    Ok((vres_id, res))
}

#[tracing::instrument(skip(state, tvc, user_vault_public_key))]
pub async fn make_watchlist_result_call(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey,
    kind: WatchlistCheckKind,
) -> FpResult<(VerificationResultId, WatchlistResultResponse)> {
    // TODO: upstream this somewhere based on OBC, maybe not even necessary for watchlist
    let config_id = IncodeConfigurationId::from("65023dbdc221a0aba52791be".to_string());
    let res = call_start_onboarding(
        state,
        tvc,
        sv_id,
        di_id,
        user_vault_public_key,
        config_id,
        IncodeEnvironment::Production,
    )
    .await?;

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
) -> FpResult<(VerificationResultId, WatchlistResultResponse)> {
    let svid = di.scoped_vault_id.clone();
    let obc_key = obc_key.clone();
    let (tenant_id, vw, obc) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            let (obc, _) = ObConfiguration::get(conn, &obc_key)?;

            // Create a BillingEvent once per year for this user
            let adverse_media = match obc.verification_checks().enhanced_aml() {
                EnhancedAmlOption::Yes { adverse_media, .. } => adverse_media,
                EnhancedAmlOption::No => false,
            };
            if adverse_media {
                BillingEvent::create(conn, &sv.id, Some(&obc.id), BEK::AdverseMediaPerYear)?;
                BillingEvent::create(conn, &sv.id, Some(&obc.id), BEK::AdverseMediaPerUser)?;
            }
            BillingEvent::create(conn, &sv.id, Some(&obc.id), BEK::ContinuousMonitoringPerYear)?;

            Ok((sv.tenant_id, vw, obc))
        })
        .await?;

    // Check if a successful result already exists and idempotently return that if so
    let existing_res =
        existing_watchlist_check_response(state, &vw.vault.e_private_key, &di.id, kind.clone()).await?;
    if let Some(existing_res) = existing_res {
        return Ok(existing_res);
    }

    let tvc =
        TenantVendorControl::new(tenant_id, &state.db_pool, &state.config, &state.enclave_client).await?;

    // dont make real call if non-Prod, unless specifically FF'd to do so
    if state.config.service_config.is_production()
        || state
            .ff_client
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
        .await //we return vres.id instead of vres just because we currently only get vres_id from
               // our VendorAPIResponseIdentifiersMap
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
    state: &State,
    vault_private_key: &EncryptedVaultPrivateKey,
    di_id: &DecisionIntentId,
    kind: WatchlistCheckKind,
) -> FpResult<Option<(VerificationResultId, WatchlistResultResponse)>> {
    let response = match kind {
        WatchlistCheckKind::MakeNewSearch => load_response_for_vendor_api(
            state,
            VReqIdentifier::DiId(di_id.clone()),
            vault_private_key,
            IncodeWatchlistCheck,
        )
        .await?
        .ok(),
        WatchlistCheckKind::GetUpdatedResults(_) => load_response_for_vendor_api(
            state,
            VReqIdentifier::DiId(di_id.clone()),
            vault_private_key,
            IncodeUpdatedWatchlistResult,
        )
        .await?
        .ok()
        .map(|(u, vres_id)| (u.0, vres_id)),
    };

    if let Some((wr, vres_id)) = response {
        Ok(Some((vres_id, wr)))
    } else {
        Ok(None)
    }
}

async fn save_canned_response(
    state: &State,
    sv_id: ScopedVaultId,
    di_id: DecisionIntentId,
    public_key: VaultPublicKey,
) -> FpResult<(VerificationResultId, WatchlistResultResponse)> {
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
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
