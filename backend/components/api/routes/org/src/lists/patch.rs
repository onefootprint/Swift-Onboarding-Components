use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::{ApiResult, ValidationError},
    types::{EmptyResponse, JsonApiResponse},
    State,
};
use api_wire_types::UpdateListRequest;

use db::models::list::List;
use newtypes::ListId;
use paperclip::actix::{api_v2_operation, patch, web};

#[api_v2_operation(description = "Updates an existing list", tags(Lists, Organization, Private))]
#[patch("/org/lists/{id}")]
pub async fn patch(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<ListId>,
    request: web::Json<UpdateListRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::WriteLists)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let id = path.into_inner();

    let UpdateListRequest { name, alias } = request.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            if List::find(conn, &tenant_id, is_live, &name, &alias)?.is_some() {
                return Err(ValidationError("List with that name already exists").into());
            }
            List::update(conn, &tenant_id, is_live, &id, name, alias)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
