use crate::ProtectedAuth;
use crate::State;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::types::ApiResponse;
use db::models::tenant_metrics::NewTenantMetrics;
use db::models::tenant_metrics::TenantMetrics;
use newtypes::TenantId;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct SetMetricsRequest {
    pub tenant_id: TenantId,
    pub data: serde_json::Value,
}


#[post("/private/tenant/footprint_wrapped")]
async fn set_metrics(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<SetMetricsRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let SetMetricsRequest { tenant_id, data } = request.into_inner();

    state
        .db_query(move |conn| {
            let new_metrics = NewTenantMetrics {
                tenant_id,
                data: serde_json::to_value(data)?,
            };
            TenantMetrics::create_or_update(conn, new_metrics)
        })
        .await?;

    Ok(api_wire_types::Empty)
}
