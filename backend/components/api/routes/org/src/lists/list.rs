use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use db::models::list::List;
use itertools::Itertools;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Retrieves all List's for Tenant",
    tags(Organization, Private, Lists)
)]
#[actix::get("/org/lists")]
pub async fn list_for_tenant(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> ApiResult<Json<ResponseData<Vec<api_wire_types::List>>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let lists = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            Ok(List::list(conn, &tenant_id, is_live)?)
        })
        .await?;

    ResponseData::ok(lists.into_iter().map(api_wire_types::List::from_db).collect_vec()).json()
}
