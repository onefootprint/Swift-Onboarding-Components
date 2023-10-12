use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::risk_signal::IncludeHidden;
use db::models::risk_signal::RiskSignal;
use db::models::scoped_vault::ScopedVault;
use db::DbResult;
use itertools::Itertools;
use newtypes::FootprintReasonCode;
use newtypes::FpId;

use paperclip::actix::{api_v2_operation, get, web};

type RiskSignalsListResponse = Vec<api_wire_types::PublicRiskSignal>;

#[api_v2_operation(
    description = "Lists the risk signals for a Footprint user.",
    tags(Users, Preview)
)]
#[get("/users/{fp_id}/risk_signals")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FpId>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<RiskSignalsListResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let signals = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            RiskSignal::latest_by_risk_signal_group_kinds(conn, &sv.id, IncludeHidden(false))
        })
        .await??
        .into_iter()
        .filter(|(_, rs)| !rs.reason_code.to_be_deprecated())
        .filter_map(|(_, rs)| {
            // FP-5097
            if !matches!(rs.reason_code, FootprintReasonCode::Other(_)) {
                Some(rs)
            } else {
                tracing::error!(reason_code=%rs.reason_code, risk_signal_id=%rs.id, "FootprintReasonCode::Other retrieved in /risk_signals");
                None
            }
        })
        .sorted_by(|s1, s2| {
            let s1 = s1.reason_code.severity();
            let s2 = s2.reason_code.severity();
            s1.cmp(&s2).reverse()
        });

    let signals = signals.map(api_wire_types::PublicRiskSignal::from_db).collect();

    ResponseData::ok(signals).json()
}
