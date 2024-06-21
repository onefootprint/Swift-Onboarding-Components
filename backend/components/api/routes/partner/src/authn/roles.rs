use api_core::auth::tenant::AnyOrgSessionAuth;
use api_core::auth::tenant::AnyPartnerTenantSessionAuth;
use api_core::serializers::IsAuthMethodSupported;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::helpers::TenantOrPartnerTenant;
use db::helpers::WorkosAuthIdentity;
use db::models::tenant_rolebinding::TenantRolebinding;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Return the list of partner tenants that can be inherited by the authed user",
    tags(Auth, Private)
)]
#[get("/partner/auth/roles")]
fn get(
    state: web::Data<State>,
    auth: AnyPartnerTenantSessionAuth,
) -> ApiListResponse<api_wire_types::PartnerOrganization> {
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
            api_wire_types::PartnerOrganization::from_db((t, Some(is_auth_supported)))
        })
        .collect();
    Ok(data)
}
