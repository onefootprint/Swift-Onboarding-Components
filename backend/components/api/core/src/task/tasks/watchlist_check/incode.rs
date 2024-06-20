use crate::decision::vendor::incode::incode_watchlist::WatchlistCheckKind;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::decision::{
    self,
};
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::State;
use chrono::Duration;
use chrono::Utc;
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::NewRiskSignalInfo;
use db::models::verification_request::RequestAndResult;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::DbResult;
use idv::ParsedResponse;
use newtypes::DataIdentifier as DI;
use newtypes::DecisionIntentId;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::IdentityDataKind as IDK;
use newtypes::IncodeWatchlistResultRef;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::VendorAPI;

pub async fn complete_vendor_call(
    state: &State,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    obc: &ObConfiguration,
    current_uvw: &VaultWrapper<Person>,
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
        .await?;

    // TODO: check 365 days
    // TODO: check if vault data has changed
    let latest_watchlist_check = watchlist_check_ref_from_latest_vres(
        state,
        &current_uvw.vault().e_private_key,
        latest_watchlist_check_vres,
    )
    .await?;

    let kind = match latest_watchlist_check {
        Some((vreq, vres, ref_)) => {
            if Utc::now() > vres.timestamp + Duration::days(365)
                || has_data_changed_since_vres(state, current_uvw, &vreq).await?
            {
                WatchlistCheckKind::MakeNewSearch
            } else {
                WatchlistCheckKind::GetUpdatedResults(ref_)
            }
        }
        None => WatchlistCheckKind::MakeNewSearch,
    };

    let (vres_id, res) =
        decision::vendor::incode::incode_watchlist::run_watchlist_check(state, &di, &obc.key, kind.clone())
            .await?;

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
) -> ApiResult<Option<(VerificationRequest, VerificationResult, IncodeWatchlistResultRef)>> {
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
                    wc.content.as_ref().and_then(|c| {
                        c.data.as_ref().and_then(|d| {
                            d.ref_
                                .clone()
                                .map(|r| (vreq_vres.vreq.clone(), vres.vres.clone(), r))
                        })
                    })
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

async fn has_data_changed_since_vres(
    state: &State,
    current_uvw: &VaultWrapper<Person>,
    vreq: &VerificationRequest,
) -> ApiResult<bool> {
    let svid = vreq.scoped_vault_id.clone();
    let seqno = vreq.uvw_snapshot_seqno;
    let uvw_for_vres = state
        .db_pool
        .db_query(move |conn| VaultWrapper::<Person>::build(conn, VwArgs::Historical(&svid, seqno)))
        .await?;

    let idks = vec![DI::Id(IDK::FirstName), DI::Id(IDK::LastName), DI::Id(IDK::Dob)];
    let current_decrypted = current_uvw
        .decrypt_unchecked(&state.enclave_client, &idks)
        .await?;
    let vres_decrypted = uvw_for_vres
        .decrypt_unchecked(&state.enclave_client, &idks)
        .await?;

    // dob technically we only send the year so theoretically we don't need to re-search if month or day
    // only have changed. but thats kinda weird so dont bother handling for now
    Ok(idks.into_iter().any(|idk| {
        is_different(
            current_decrypted.get_di(idk.clone()).ok(),
            vres_decrypted.get_di(idk).ok(),
        )
    }))
}

fn is_different(s1: Option<PiiString>, s2: Option<PiiString>) -> bool {
    match (s1, s2) {
        (None, None) => false,
        (None, Some(_)) => true,
        (Some(_), None) => true,
        (Some(s1), Some(s2)) => s1.leak_to_string().to_lowercase() != s2.leak_to_string().to_lowercase(),
    }
}
