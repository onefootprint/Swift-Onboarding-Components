use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::errors::ApiResult;
use api_core::types::{
    EmptyResponse,
    ResponseData,
};
use api_core::State;
use db::models::list::List;
use newtypes::ListId;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(description = "Delete the List", tags(Lists, Organization, Private))]
#[actix::delete("/org/lists/{list_id}")]
pub async fn deactivate_list(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    list_id: web::Path<ListId>,
) -> ApiResult<Json<ResponseData<EmptyResponse>>> {
    let auth = auth.check_guard(TenantGuard::WriteLists)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let list = List::lock(conn, &tenant_id, is_live, &list_id)?;
            List::deactivate(conn, list)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
