use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::errors::ApiResult;
use api_core::types::JsonApiResponse;
use db::models::auth_event::AuthEvent;
use db::models::scoped_vault::ScopedVault;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(description = "View a user's recent device insights", tags(Entities, Private))]
#[get("/entities/{fp_id}/auth_events")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<Vec<api_wire_types::AuthEvent>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let events = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let (events, _) = AuthEvent::list(conn, &sv.id, None)?;
            Ok(events)
        })
        .await??;

    let response = events
        .into_iter()
        .map(api_wire_types::AuthEvent::from_db)
        .collect::<Vec<_>>();
    Ok(Json(ResponseData::ok(response)))
}
