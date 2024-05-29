use crate::errors::ApiResult;
use crate::types::{
    JsonApiResponse,
    OffsetPaginationRequest,
};
use crate::State;
use api_core::auth::tenant::PartnerTenantSessionAuth;
use api_route_org_common::roles as roles_common;
use api_wire_types::OrgRoleFilters;
use newtypes::TenantRoleId;
use paperclip::actix::{
    api_v2_operation,
    get,
    patch,
    post,
    web,
};

#[api_v2_operation(
    tags(Roles, OrgSettings, Private),
    description = "Returns a list of IAM roles for the tenant."
)]
#[get("/partner/roles")]
async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgRoleFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: PartnerTenantSessionAuth,
) -> ApiResult<roles_common::RolesResponse> {
    roles_common::get(state, filters, pagination, auth.into()).await
}

#[api_v2_operation(
    tags(Roles, OrgSettings, Private),
    description = "Create a new IAM role for the tenant."
)]
#[post("/partner/roles")]
async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateTenantRoleRequest>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    roles_common::post(state, request, auth.into()).await
}

#[api_v2_operation(
    tags(Roles, OrgSettings, Private),
    description = "Updates the provided IAM role."
)]
#[patch("/partner/roles/{tenant_role_id}")]
pub async fn patch(
    state: web::Data<State>,
    request: web::Json<api_wire_types::UpdateTenantRoleRequest>,
    role_id: web::Path<TenantRoleId>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    roles_common::patch(state, request, role_id, auth.into()).await
}

#[api_v2_operation(
    tags(Roles, OrgSettings, Private),
    description = "Deactivates the provided IAM role."
)]
#[post("/partner/roles/{tenant_role_id}/deactivate")]
pub async fn deactivate(
    state: web::Data<State>,
    role_id: web::Path<TenantRoleId>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    roles_common::deactivate(state, role_id, auth.into()).await
}
