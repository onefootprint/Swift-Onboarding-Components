use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::utils::fp_id_path::FpIdPath;
use paperclip::actix::web::Json;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

#[api_v2_operation(
    description = "Allows a tenant to view a customer's registered webauthn credentials.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/liveness")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ResponseData<Vec<api_wire_types::LivenessEvent>>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let liveness_events = state
        .db_pool
        .db_query(move |conn| {
            db::models::liveness_event::LivenessEvent::get_for_scoped_user(conn, &fp_id, &tenant_id, is_live)
        })
        .await?;

    let response = liveness_events
        .into_iter()
        .map(api_wire_types::LivenessEvent::from_db)
        .collect::<Vec<_>>();
    Ok(Json(ResponseData::ok(response)))
}
