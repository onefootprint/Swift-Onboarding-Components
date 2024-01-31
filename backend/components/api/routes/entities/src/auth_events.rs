use crate::{
    auth::{
        tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
        Either,
    },
    types::response::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{
    auth::tenant::SecretTenantAuthContext, errors::ApiResult, types::JsonApiResponse,
    utils::fp_id_path::FpIdPath,
};
use db::models::{auth_event::AuthEvent, scoped_vault::ScopedVault};
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(
    description = "View a user's recent device insights",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/auth_events")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
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
