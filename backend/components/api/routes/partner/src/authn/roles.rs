use api_core::auth::tenant::{
    AnyOrgSessionAuth,
    AnyPartnerTenantSessionAuth,
};
use api_core::errors::ApiError;
use api_core::serializers::IsAuthMethodSupported;
use api_core::types::response::ResponseData;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::PartnerOrganization;
use db::helpers::{
    TenantOrPartnerTenant,
    WorkosAuthIdentity,
};
use db::models::tenant_rolebinding::TenantRolebinding;
use paperclip::actix::web::Json;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

pub type RolesResponse = Vec<PartnerOrganization>;

#[api_v2_operation(
    description = "Return the list of partner tenants that can be inherited by the authed user",
    tags(Auth, Private)
)]
#[get("/partner/auth/roles")]
fn get(
    state: web::Data<State>,
    auth: AnyPartnerTenantSessionAuth,
) -> actix_web::Result<Json<ResponseData<RolesResponse>>, ApiError> {
    let auth_method = auth.auth_method();
    let tu_id = auth.tenant_user_id()?;
    let tenants = state
        .db_pool
        .db_transaction(move |conn| TenantRolebinding::list_by_user(conn, &tu_id))
        .await?
        .into_iter()
        .filter_map(|(_, t_or_pt)| match t_or_pt {
            TenantOrPartnerTenant::Tenant(_) => None,
            TenantOrPartnerTenant::PartnerTenant(pt) => Some(pt),
        });

    let data = tenants
        .map(move |t| {
            let is_auth_supported = IsAuthMethodSupported(t.supports_auth_method(auth_method));
            PartnerOrganization::from_db((t, Some(is_auth_supported)))
        })
        .collect();
    ResponseData::ok(data).json()
}
