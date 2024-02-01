use crate::{errors::ApiError, types::response::ResponseData, utils::db2api::DbToApi, State};
use api_core::{auth::tenant::AnyTenantSessionAuth, serializers::IsAuthMethodSupported};
use api_wire_types::Organization;
use db::models::tenant_rolebinding::TenantRolebinding;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

pub type RolesResponse = Vec<Organization>;

#[api_v2_operation(
    description = "Return the list of tenants that can be inherited by the authed user",
    tags(Auth, Private)
)]
#[get("/org/auth/roles")]
fn get(
    state: web::Data<State>,
    tenant_auth: AnyTenantSessionAuth,
) -> actix_web::Result<Json<ResponseData<RolesResponse>>, ApiError> {
    let auth_method = tenant_auth.auth_method();
    let tu_id = tenant_auth.tenant_user_id()?;
    let tenants = state
        .db_pool
        .db_query(move |conn| TenantRolebinding::list_by_user(conn, &tu_id))
        .await?
        .into_iter()
        .map(|(_, tenant)| tenant);

    let data = tenants
        .map(move |t| {
            let is_auth_supported = IsAuthMethodSupported(t.supports_auth_method(auth_method));
            Organization::from_db((t, is_auth_supported))
        })
        .collect();
    ResponseData::ok(data).json()
}
