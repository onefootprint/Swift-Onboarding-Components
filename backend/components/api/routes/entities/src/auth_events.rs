use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(description = "View a user's device insights", tags(Entities, Private))]
#[get("/entities/{fp_id}/auth_events")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ResponseData<Vec<api_wire_types::AuthEvent>>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let events = state
        .db_pool
        .db_query(move |conn| {
            db::models::auth_event::AuthEvent::list_for_scoped_vault(conn, &fp_id, &tenant_id, is_live)
        })
        .await??;

    let response = events
        .into_iter()
        .map(api_wire_types::AuthEvent::from_db)
        .collect::<Vec<_>>();
    Ok(Json(ResponseData::ok(response)))
}
