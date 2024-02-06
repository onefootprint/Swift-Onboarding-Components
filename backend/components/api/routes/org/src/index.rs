use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    types::{response::ResponseData, JsonApiResponse},
    utils::db2api::DbToApi,
    State,
};
use actix_web::web;
use api_core::{errors::tenant::TenantError, serializers::IsDomainAlreadyClaimed};
use api_wire_types::UpdateTenantRequest;
use db::models::tenant::{Tenant, UpdateTenant};
use paperclip::actix::{self, api_v2_operation, patch, web::Json};

#[api_v2_operation(
    tags(Organization, OrgSettings, Private),
    description = "Returns basic info about the authed tenant"
)]
#[actix::get("/org")]
pub async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::Organization> {
    let auth = auth.check_guard(TenantGuard::Read)?; // No permissions needed to access this endpoint
    let tenant = auth.tenant().clone();

    let domains = tenant.domains.clone();
    let is_domain_already_claimed = state
        .db_pool
        .db_query(move |conn| Tenant::is_domain_already_claimed(conn, domains))
        .await?;

    Ok(Json(ResponseData::ok(api_wire_types::Organization::from_db((
        tenant,
        IsDomainAlreadyClaimed(is_domain_already_claimed),
    )))))
}

#[api_v2_operation(
    tags(Organization, OrgSettings, Private),
    description = "Updates the basic information for the tenant"
)]
#[patch("/org")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::Organization> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let UpdateTenantRequest {
        name,
        website_url,
        company_size,
        logo_url,
        privacy_policy_url,
        allow_domain_access,
        support_email,
        support_phone,
        support_website,
        clear_support_email,
        clear_support_phone,
        clear_support_website,
    } = request.into_inner();

    if allow_domain_access == Some(true) && tenant.domains.is_empty() {
        return Err(TenantError::ValidationError("Tenant has no associated domain".to_string()).into());
    }

    // Compute whether we are clearing, setting, or no-oping
    let clear_or_set = |clear: Option<bool>, new_v: Option<String>| {
        clear.is_some_and(|v| v).then_some(None).or(new_v.map(Some))
    };

    let support_email = clear_or_set(clear_support_email, support_email);
    let support_phone = clear_or_set(clear_support_phone, support_phone);
    let support_website = clear_or_set(clear_support_website, support_website);

    // Note: Tenant domain uniqueness constraint protects us from having multiple tenants with the same domain and allow_domain_access true
    let update_tenant = UpdateTenant {
        name,
        logo_url,
        website_url,
        company_size,
        privacy_policy_url,
        allow_domain_access,
        support_email,
        support_phone,
        support_website,
        stripe_customer_id: None,
    };
    let updated_tenant = state
        .db_pool
        .db_query(move |conn| Tenant::update(conn, &tenant_id, update_tenant))
        .await?;

    Ok(Json(ResponseData::ok(api_wire_types::Organization::from_db(
        updated_tenant,
    ))))
}
