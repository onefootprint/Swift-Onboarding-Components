use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::decision::vendor::neuro_id::tenant_can_view_neuro;
use api_core::types::ApiListResponse;
use api_core::utils::fp_id_path::FpIdPath;
use db::models::risk_signal::AtSeqno;
use db::models::risk_signal::RiskSignal;
use db::models::scoped_vault::ScopedVault;
use db::DbResult;
use itertools::Itertools;
use newtypes::FootprintReasonCode;
use newtypes::PreviewApi;
use newtypes::VendorAPI;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Lists the risk signals for a Footprint user.",
    // TODO don't take out of preview unless we paginate this API
    tags(Users, Preview)
)]
#[get("/users/{fp_id}/risk_signals")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: SecretTenantAuthContext,
) -> ApiListResponse<api_wire_types::PublicRiskSignal> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    auth.check_preview_guard(PreviewApi::RiskSignalsList)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();
    let can_view_neuro = tenant_can_view_neuro(&state, &tenant_id);

    let signals = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            RiskSignal::latest_by_risk_signal_group_kinds(conn, &sv.id, AtSeqno(None))
        })
        .await?
        .into_iter()
        .filter(|(_, rs)| !rs.reason_code.to_be_deprecated())
        .filter(|(_, rs)| {
            if matches!(rs.vendor_api, VendorAPI::NeuroIdAnalytics) {
               can_view_neuro
            } else {
                true
            }
        })
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

    Ok(signals)
}
