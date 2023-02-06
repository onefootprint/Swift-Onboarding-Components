use crate::auth::tenant::Any;
use crate::auth::tenant::AuthActor;
use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantRbAuthContext;
use crate::auth::tenant::TenantSessionAuth;
use crate::errors::tenant::TenantError;
use crate::types::JsonApiResponse;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::tenant_user::TenantUser;
use db::models::tenant_user::TenantUserUpdate;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, web};

#[api_v2_operation(tags(OrgSettings), description = "Returns info on the authed user.")]
#[get("/org/member")]
async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::BasicOrganizationMember> {
    let role = auth.role().clone();
    let auth = auth.check_guard(TenantGuard::Read)?;
    let user_id = match auth.actor() {
        AuthActor::TenantUser(tenant_user_id) => tenant_user_id,
        _ => return Err(TenantError::ValidationError("Non-user principal".to_owned()).into()),
    };
    let user = state
        .db_pool
        .db_query(move |conn| TenantUser::get(conn, &user_id))
        .await??;

    let result = api_wire_types::BasicOrganizationMember::from_db((user, role));
    ResponseData::ok(result).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantUserRequest {
    first_name: Option<String>,
    last_name: Option<String>,
}

#[api_v2_operation(tags(OrgSettings), description = "Updates the authed user.")]
#[patch("/org/member")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantUserRequest>,
    // Weird to take in an impersonation token here
    auth: TenantRbAuthContext,
) -> JsonApiResponse<api_wire_types::BasicOrganizationMember> {
    let role = auth.role().clone();
    let auth = auth.check_guard(Any)?;

    let UpdateTenantUserRequest {
        first_name,
        last_name,
    } = request.into_inner();

    let user_id = match auth.actor() {
        AuthActor::TenantUser(tenant_user_id) => tenant_user_id,
        _ => return Err(TenantError::ValidationError("Cannot patch non-user principal".to_owned()).into()),
    };

    let user_update = TenantUserUpdate {
        first_name,
        last_name,
    };
    let user = state
        .db_pool
        .db_transaction(move |conn| TenantUser::update(conn, &user_id, user_update))
        .await?;

    let result = api_wire_types::BasicOrganizationMember::from_db((user, role));
    ResponseData::ok(result).json()
}
