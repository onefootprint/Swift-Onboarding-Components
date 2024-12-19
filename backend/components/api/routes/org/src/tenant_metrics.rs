use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::ApiResponse;
use api_core::State;
use api_errors::FpDbOptionalExtension;
use db::models::tenant_metrics::TenantMetrics;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;


#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder, paperclip::actix::Apiv2Schema)]
pub struct TenantMetricResponse(Option<serde_json::Value>);

#[api_v2_operation(
    description = "Lists the footprint wrapped metrics for a tenant.",
    tags(Org, Private)
)]
#[get("/org/footprint_wrapped")]
pub async fn get(state: web::Data<State>, auth: TenantSessionAuth) -> ApiResponse<TenantMetricResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();

    let metrics = state
        .db_query(move |conn| TenantMetrics::get(conn, &tenant_id).optional())
        .await?;
    let res = TenantMetricResponse(metrics.map(|m| m.data));

    Ok(res)
}
