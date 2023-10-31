use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use newtypes::FpId;
use newtypes::PreviewApi;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(
    description = "Lists the liveness signals for the provided user.",
    tags(Entities, Preview)
)]
#[get("/users/{fp_id}/liveness")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FpId>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ResponseData<Vec<api_wire_types::LivenessEvent>>>, ApiError> {
    auth.check_preview_guard(PreviewApi::LivenessList)?;
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let liveness_events = state
        .db_pool
        .db_query(move |conn| {
            db::models::liveness_event::LivenessEvent::get_for_scoped_user(conn, &fp_id, &tenant_id, is_live)
        })
        .await??;

    let response = liveness_events
        .into_iter()
        .map(api_wire_types::LivenessEvent::from_db)
        .collect::<Vec<_>>();
    Ok(Json(ResponseData::ok(response)))
}
