use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::Any;
use api_core::serializers::IsAuthMethodSupported;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::Organization;
use db::helpers::TenantOrPartnerTenant;
use db::helpers::WorkosAuthIdentity;
use db::models::tenant_rolebinding::TenantRolebinding;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Return the list of tenants that can be inherited by the authed user",
    tags(Auth, Private)
)]
#[get("/org/auth/roles")]
fn get(state: web::Data<State>, auth: TenantSessionAuth) -> ApiListResponse<Organization> {
    let auth_method = auth.auth_method();
    let auth = auth.check_guard(Any)?;
    let actor = auth.actor();
    let tu_id = actor.tenant_user_id()?.clone();
    let tenants = state
        .db_transaction(move |conn| TenantRolebinding::list_by_user(conn, &tu_id))
        .await?
        .into_iter()
        .filter_map(|(_, t_or_pt)| match t_or_pt {
            TenantOrPartnerTenant::Tenant(t) => Some(t),
            TenantOrPartnerTenant::PartnerTenant(_) => None,
        });

    let data = tenants
        .sorted_by_key(|t| t.name.to_lowercase().clone())
        .map(move |t| {
            let is_auth_supported = IsAuthMethodSupported(t.supports_auth_method(auth_method));
            Organization::from_db((t, is_auth_supported))
        })
        .collect();
    Ok(data)
}
