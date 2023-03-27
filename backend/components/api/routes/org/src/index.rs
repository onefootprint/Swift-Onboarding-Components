use crate::auth::tenant::{CheckTenantGuard, TenantSessionAuth};
use crate::auth::tenant::{SecretTenantAuthContext, TenantGuard};
use crate::auth::Either;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::utils::db2api::DbToApi;
use crate::State;
use actix_web::web;
use api_wire_types::UpdateTenantRequest;
use db::models::tenant::{Tenant, UpdateTenant};
use paperclip::actix::patch;
use paperclip::actix::{self, api_v2_operation, web::Json};

#[api_v2_operation(
    tags(Organization, OrgSettings, Preview),
    description = "Returns basic info about the authed tenant"
)]
#[actix::get("/org")]
pub async fn get(
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<api_wire_types::Organization> {
    let auth = auth.check_guard(TenantGuard::Read)?; // No permissions needed to access this endpoint
    let tenant = auth.tenant().clone();

    Ok(Json(ResponseData::ok(api_wire_types::Organization::from_db(
        tenant,
    ))))
}

#[api_v2_operation(
    tags(Organization, OrgSettings, Preview),
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
    } = request.into_inner();

    let update_tenant = UpdateTenant {
        name,
        logo_url,
        website_url,
        company_size,
        privacy_policy_url,
        stripe_customer_id: None,
    };
    let updated_tenant = state
        .db_pool
        .db_query(move |conn| Tenant::update(conn, &tenant_id, update_tenant))
        .await??;

    Ok(Json(ResponseData::ok(api_wire_types::Organization::from_db(
        updated_tenant,
    ))))
}
