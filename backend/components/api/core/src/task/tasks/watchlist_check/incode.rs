use crate::decision::vendor::incode_watchlist::WatchlistCheckKind;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::decision::{self};
use crate::errors::ApiResult;
use crate::State;
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::NewRiskSignalInfo;
use db::models::verification_request::RequestAndResult;
use db::models::verification_result::VerificationResult;
use db::DbResult;
use idv::ParsedResponse;
use newtypes::{
    DecisionIntentId, EncryptedVaultPrivateKey, IncodeWatchlistResultRef, ScopedVaultId, VendorAPI,
};

pub async fn complete_vendor_call(
    state: &State,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    obc: &ObConfiguration,
    user_vault_private_key: &EncryptedVaultPrivateKey,
) -> ApiResult<Vec<NewRiskSignalInfo>> {
    let sv_id = sv_id.clone();
    let di_id = di_id.clone();
    let (di, latest_watchlist_check_vres) = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let di = DecisionIntent::get(conn, &di_id)?;
            let latest_watchlist_check_vres = VerificationResult::get_latest_successful_by_vendor_api(
                conn,
                &sv_id,
                &VendorAPI::IncodeWatchlistCheck,
            )?;

            Ok((di, latest_watchlist_check_vres))
        })
        .await??;

    // TODO: check 365 days
    // TODO: check if vault data has changed
    let latest_watchlist_check_ref =
        watchlist_check_ref_from_latest_vres(state, user_vault_private_key, latest_watchlist_check_vres)
            .await?;

    let kind = match latest_watchlist_check_ref {
        Some(ref_) => WatchlistCheckKind::GetUpdatedResults(ref_),
        None => WatchlistCheckKind::MakeNewSearch,
    };

    let (vres_id, res) =
        decision::vendor::incode_watchlist::run_watchlist_check(state, &di, &obc.key, kind.clone()).await?;

    let reason_codes =
        decision::features::incode_watchlist::reason_codes_from_watchlist_result(&res, &obc.enhanced_aml);

    // TODO: vendor_api here should be either IncodeWatchlistCheck or IncodeUpdatedWatchlistResult
    Ok(reason_codes
        .into_iter()
        .map(|r| (r, kind.clone().into(), vres_id.clone()))
        .collect())
}

async fn watchlist_check_ref_from_latest_vres(
    state: &State,
    user_vault_private_key: &EncryptedVaultPrivateKey,
    latest_watchlist_check_vres: Option<RequestAndResult>,
) -> ApiResult<Option<IncodeWatchlistResultRef>> {
    let watchlist_ref = if let Some(latest_watchlist_check_vres) = latest_watchlist_check_vres {
        let vreq_vres = VendorResult::hydrate_vendor_result(
            latest_watchlist_check_vres,
            &state.enclave_client,
            user_vault_private_key,
        )
        .await?;
        if let Some(vres) = vreq_vres.vres {
            if let Some(res) = vres.response {
                if let ParsedResponse::IncodeWatchlistCheck(wc) = res.response {
                    wc.content
                        .as_ref()
                        .and_then(|c| c.data.as_ref().and_then(|d| d.ref_.clone()))
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    Ok(watchlist_ref)
}
