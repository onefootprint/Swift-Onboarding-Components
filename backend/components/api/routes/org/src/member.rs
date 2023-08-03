use crate::auth::tenant::AuthActor;
use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantRbAuthContext;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Any;
use crate::errors::tenant::TenantError;
use crate::types::JsonApiResponse;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::Either;
use db::models::tenant_user::TenantUser;
use db::models::tenant_user::TenantUserUpdate;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, web};

#[api_v2_operation(tags(OrgSettings, Private), description = "Returns info on the authed user.")]
#[get("/org/member")]
async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::AuthOrgMember> {
    let rb = match &auth {
        Either::Left(a) => a.rolebinding().cloned(),
        Either::Right(_) => None,
    };
    // Fetch the scopes from the auth token, which may have some additional dynamic permissions for
    // firm employee users
    let scopes = auth.token_scopes();
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant().clone();
    let user_id = match auth.actor() {
        AuthActor::TenantUser(tenant_user_id) => tenant_user_id,
        AuthActor::FirmEmployee(tenant_user_id) => tenant_user_id,
        _ => return Err(TenantError::ValidationError("Non-user principal".to_owned()).into()),
    };
    let user = state
        .db_pool
        .db_query(move |conn| TenantUser::get(conn, &user_id))
        .await??;

    let result = api_wire_types::AuthOrgMember::from_db((user, rb, tenant, scopes));
    ResponseData::ok(result).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantUserRequest {
    first_name: Option<String>,
    last_name: Option<String>,
}

#[api_v2_operation(tags(OrgSettings, Private), description = "Updates the authed user.")]
#[patch("/org/member")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantUserRequest>,
    // Weird to take in an impersonation token here, so we only take TenantRbAuth
    auth: TenantRbAuthContext,
) -> JsonApiResponse<api_wire_types::AuthOrgMember> {
    let scopes = auth.token_scopes();
    let rb = auth.rolebinding().cloned();
    let auth = auth.check_guard(Any)?;
    let tenant = auth.tenant().clone();

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

    let result = api_wire_types::AuthOrgMember::from_db((user, rb, tenant, scopes));
    ResponseData::ok(result).json()
}
