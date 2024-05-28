use actix_web::{patch, web};
use api_core::{
    auth::protected_auth::ProtectedAuth,
    errors::ApiResult,
    types::{JsonApiResponse, ResponseData},
    utils::db2api::DbToApi,
    State,
};
use db::models::{
    billing_profile::BillingProfile,
    tenant::{PrivateUpdateTenant, Tenant},
};
use newtypes::TenantId;

#[patch("/private/tenants/{id}")]
async fn patch(
    state: web::Data<State>,
    _: ProtectedAuth,
    id: web::Path<TenantId>,
    request: web::Json<api_wire_types::PrivatePatchTenant>,
) -> JsonApiResponse<api_wire_types::PrivateTenantDetail> {
    let id = id.into_inner();
    let api_wire_types::PrivatePatchTenant {
        name,
        domains,
        allow_domain_access,
        sandbox_restricted,
        is_prod_kyc_playbook_restricted,
        is_prod_kyb_playbook_restricted,
        is_prod_auth_playbook_restricted,
        allowed_preview_apis,
        is_demo_tenant,
        super_tenant_id,
    } = request.into_inner();

    let (tenant, bp) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let update = PrivateUpdateTenant {
                name,
                domains,
                allow_domain_access,
                sandbox_restricted,
                is_prod_ob_config_restricted: is_prod_kyc_playbook_restricted,
                is_prod_kyb_playbook_restricted,
                is_prod_auth_playbook_restricted,
                allowed_preview_apis,
                is_demo_tenant,
                super_tenant_id,
            };
            let tenant = Tenant::private_update(conn, &id, update)?;
            let bp = BillingProfile::get(conn, &tenant.id)?;
            Ok((tenant, bp))
        })
        .await?;

    let response = api_wire_types::PrivateTenantDetail::from_db((tenant, bp));
    ResponseData::ok(response).json()
}
