use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::errors::ValidationError;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_core::State;
use api_wire_types::UpdateListRequest;
use db::models::list::List;
use newtypes::ListId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::patch;
use paperclip::actix::web;

#[api_v2_operation(description = "Updates an existing list", tags(Lists, Organization, Private))]
#[patch("/org/lists/{list_id}")]
pub async fn patch(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    list_id: web::Path<ListId>,
    request: web::Json<UpdateListRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::WriteLists)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let list_id = list_id.into_inner();

    let UpdateListRequest { name, alias } = request.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            if List::find(conn, &tenant_id, is_live, &name, &alias)?.is_some() {
                return Err(ValidationError("List with that name already exists").into());
            }
            List::update(conn, &tenant_id, is_live, &list_id, name, alias)?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
