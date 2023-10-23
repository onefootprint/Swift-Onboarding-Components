use crate::decision::vendor::incode_watchlist::WatchlistCheckKind;
use crate::decision::{self};
use crate::errors::ApiResult;
use crate::State;
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::NewRiskSignalInfo;
use newtypes::DecisionIntentId;

pub async fn complete_vendor_call(
    state: &State,
    di_id: &DecisionIntentId,
    obc: &ObConfiguration,
) -> ApiResult<Vec<NewRiskSignalInfo>> {
    let di_id = di_id.clone();
    let di = state
        .db_pool
        .db_query(move |conn| DecisionIntent::get(conn, &di_id))
        .await??;
    let kind = WatchlistCheckKind::MakeNewSearch; // TODO: logic to determine if we need to make a new call or can do an update call
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
