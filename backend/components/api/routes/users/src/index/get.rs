use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::errors::ApiResult;
use crate::types::response::CursorPaginatedResponse;
use crate::types::CursorPaginationRequest;
use crate::types::JsonApiResponse;
use crate::State;
use api_route_entities::get_entities;
use api_route_entities::get_entity;
use api_wire_types::ListUsersRequest;
use newtypes::FpId;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

pub type UserDetailResponse = api_wire_types::User;
pub type UserListResponse = Vec<UserDetailResponse>;

//
// These are maintained for backwards compatibility - the new GET /entities is a superset of this functionality
//

#[api_v2_operation(
    description = "View list of users that have started onboarding to the tenant.",
    tags(Users, Preview)
)]
#[get("/users")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<ListUsersRequest>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> ApiResult<Json<CursorPaginatedResponse<UserListResponse, i64>>> {
    let results = get_entities(state, filters, pagination, auth, Some(VaultKind::Person)).await?;
    Ok(results)
}

#[api_v2_operation(description = "View details of a specific user", tags(Users, Preview))]
#[get("/users/{footprint_user_id}")]
pub async fn get_detail(
    state: web::Data<State>,
    footprint_user_id: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<UserDetailResponse> {
    // Could technically pass a business fp id here
    let result = get_entity(state, footprint_user_id, auth).await?;
    Ok(result)
}
