use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantUserAuthContext;
use crate::auth::Either;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;

use crate::utils::db2api::DbToApi;
use crate::State;

use api_wire_types::RiskSignalFilters;
use db::models::risk_signal::RiskSignal;
use itertools::Itertools;
use newtypes::FootprintUserId;
use newtypes::RiskSignalId;
use newtypes::TenantScope;

use paperclip::actix::{api_v2_operation, get, web};

type RiskSignalsDetailResponse = api_wire_types::RiskSignal;
type RiskSignalsListResponse = Vec<RiskSignalsDetailResponse>;

#[api_v2_operation(
    description = "Lists the risk signals for a footprint user.",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}/risk_signals")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FootprintUserId>,
    filters: web::Query<RiskSignalFilters>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<RiskSignalsListResponse> {
    let auth = auth.check_permissions(TenantScope::Users)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let footprint_user_id = request.into_inner();

    let signals = state
        .db_pool
        .db_query(move |conn| RiskSignal::list(conn, &footprint_user_id, &tenant_id, is_live))
        .await??;
    // TODO this is fine to do in RAM when there aren't many signals. Will be harder with pagination.
    // Maybe we should store the note, severity, and scopes in the DB
    let signals = filter_and_sort(signals, filters.into_inner());
    let signals = signals
        .into_iter()
        .map(api_wire_types::RiskSignal::from_db)
        .collect();

    ResponseData::ok(signals).json()
}

fn filter_and_sort(signals: Vec<RiskSignal>, filters: RiskSignalFilters) -> Vec<RiskSignal> {
    signals
        .into_iter()
        .filter(|signal| {
            let rc = signal.reason_code;
            if !filters.scope.is_empty() && !rc.scopes().iter().any(|x| filters.scope.contains(x)) {
                return false;
            }
            if !filters.severity.is_empty() && !filters.severity.contains(&rc.severity()) {
                return false;
            }
            if let Some(ref description) = filters.description {
                if !rc
                    .description()
                    .to_ascii_lowercase()
                    .contains(&description.to_ascii_lowercase())
                {
                    return false;
                }
            }
            true
        })
        .sorted_by(|s1, s2| {
            let s1 = s1.reason_code.severity();
            let s2 = s2.reason_code.severity();
            s1.cmp(&s2).reverse()
        })
        .collect()
}

#[api_v2_operation(
    description = "Lists the risk signals for a footprint user.",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}/risk_signals/{signal_id}")]
pub async fn get_detail(
    state: web::Data<State>,
    request: web::Path<(FootprintUserId, RiskSignalId)>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<RiskSignalsDetailResponse> {
    let auth = auth.check_permissions(TenantScope::Users)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (footprint_user_id, risk_signal_id) = request.into_inner();

    let (signal, verification_results) = state
        .db_pool
        .db_query(move |conn| RiskSignal::get(conn, &risk_signal_id, &footprint_user_id, &tenant_id, is_live))
        .await??;
    let signal = api_wire_types::RiskSignal::from_db((signal, Some(verification_results)));

    ResponseData::ok(signal).json()
}
