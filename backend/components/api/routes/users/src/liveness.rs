use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::types::ApiListResponse;
use api_core::utils::fp_id_path::FpIdPath;
use db::models::liveness_event::LivenessEvent;
use newtypes::PreviewApi;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Lists the liveness signals for the provided user. This API is deprecated in favor of the `auth_events` API.",
    tags(Users, PhasedOut)
)]
#[get("/users/{fp_id}/liveness")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: SecretTenantAuthContext,
) -> ApiListResponse<api_wire_types::LivenessEvent> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    auth.check_preview_guard(PreviewApi::LivenessList)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let liveness_events = state
        .db_pool
        .db_query(move |conn| LivenessEvent::get_for_scoped_user(conn, &fp_id, &tenant_id, is_live))
        .await?;

    let response = liveness_events
        .into_iter()
        .map(api_wire_types::LivenessEvent::from_db)
        .collect();
    Ok(response)
}
