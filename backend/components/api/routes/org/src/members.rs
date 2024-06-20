use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ModernApiResult;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginationRequest;
use api_core::State;
use api_route_org_common::members as members_common;
use api_wire_types::OrgMemberFilters;
use newtypes::TenantUserId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::patch;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;

#[api_v2_operation(
    tags(Members, OrgSettings, Private),
    description = "Returns a list of dashboard members for the tenant"
)]
#[get("/org/members")]
async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgMemberFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantSessionAuth,
) -> ModernApiResult<Json<OffsetPaginatedResponse<api_wire_types::OrganizationMember>>> {
    members_common::get(state, filters, pagination, auth.into()).await
}

#[api_v2_operation(
    tags(Members, OrgSettings, Private),
    description = "Create a new IAM user for the tenant. Sends an invite link via WorkOs"
)]
#[post("/org/members")]
async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateTenantUserRequest>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::OrganizationMember> {
    members_common::post(state, request, auth.into()).await
}

#[api_v2_operation(
    tags(Members, OrgSettings, Private),
    description = "Updates the provided member."
)]
#[patch("/org/members/{tenant_user_id}")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<api_wire_types::UpdateTenantRolebindingRequest>,
    tu_id: web::Path<TenantUserId>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::OrganizationMember> {
    members_common::patch(state, request, tu_id, auth.into()).await
}

#[api_v2_operation(
    tags(Members, OrgSettings, Private),
    description = "Deactivates the provided user."
)]
#[post("/org/members/{tenant_user_id}/deactivate")]
async fn deactivate(
    state: web::Data<State>,
    tu_id: web::Path<TenantUserId>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::Empty> {
    members_common::deactivate(state, tu_id, auth.into()).await
}
