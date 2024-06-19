use actix_web::web;
use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::errors::tenant::TenantError;
use api_core::errors::ApiResult;
use api_core::serializers::IsDomainAlreadyClaimed;
use api_core::types::JsonApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::UpdateTenantRequest;
use db::models::tenant::{
    Tenant,
    UpdateTenant,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    patch,
};

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
    let (is_domain_already_claimed, tenant_with_parent) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            Ok((
                Tenant::is_domain_already_claimed(conn, &domains)?,
                tenant.with_parent(conn)?,
            ))
        })
        .await?;

    Ok(api_wire_types::Organization::from_db((
        tenant_with_parent,
        IsDomainAlreadyClaimed(is_domain_already_claimed),
    )))
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

    let update_tenant = UpdateTenant {
        name,
        logo_url: None,
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
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = Tenant::lock(conn, &tenant_id)?;

            // If we're enabling domain access, ensure the tenant's domains aren't already claimed.
            // TODO: Enforce this better with a uniqueness constraint on claimed domains in the DB.
            if !tenant.allow_domain_access
                && update_tenant.allow_domain_access.is_some_and(|allow| allow)
                && Tenant::is_domain_already_claimed(conn, &tenant.domains)?
            {
                return Err(TenantError::ValidationError(
                    "Can not allow domain access: domains are already claimed".to_string(),
                )
                .into());
            }

            let tenant = if update_tenant == UpdateTenant::default() {
                tenant
            } else {
                Tenant::update(conn, &tenant_id, update_tenant)?
            }
            .with_parent(conn)?;
            Ok(tenant)
        })
        .await?;

    Ok(api_wire_types::Organization::from_db(updated_tenant))
}
