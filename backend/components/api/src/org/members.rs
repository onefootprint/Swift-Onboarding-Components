use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::WorkOsAuthContext;
use crate::errors::tenant::TenantError;
use crate::errors::ApiError;
use crate::org::workos::magic_link::create_and_send_magic_link;
use crate::types::EmptyRequest;
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::types::PaginatedRequest;
use crate::types::PaginatedResponseData;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use chrono::{DateTime, Utc};
use db::models::tenant_role::TenantRole;
use db::models::tenant_user::{TenantUser, TenantUserUpdate};
use newtypes::TenantPermission;
use newtypes::TenantRoleId;
use newtypes::TenantUserId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json};

#[api_v2_operation(
    summary = "/org/members",
    operation_id = "org-members",
    tags(Private),
    description = "Returns a list of dashboard members for the tenant."
)]
#[get("/members")]
async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<EmptyRequest, DateTime<Utc>>>,
    auth: WorkOsAuthContext,
) -> actix_web::Result<
    Json<PaginatedResponseData<Vec<api_wire_types::OrganizationMember>, DateTime<Utc>>>,
    ApiError,
> {
    let auth = auth.check_permissions(vec![TenantPermission::OrgSettings])?;
    let tenant = auth.tenant();
    let cursor = request.cursor;
    let page_size = request.page_size(&state);

    let tenant_id = tenant.id.clone();
    let results = state
        .db_pool
        .db_query(move |conn| TenantUser::list_active(conn, &tenant_id, cursor, (page_size + 1) as i64))
        .await??;

    let cursor = request.cursor_item(&state, &results).map(|x| x.0.created_at);
    let results = results
        .into_iter()
        .take(page_size)
        .map(api_wire_types::OrganizationMember::from_db)
        .collect::<Vec<api_wire_types::OrganizationMember>>();
    Ok(Json(PaginatedResponseData::ok(results, cursor, None)))
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct CreateTenantUserRequest {
    email: String,
    role_id: TenantRoleId,
    redirect_url: String, // The URL to the dashboard where the invite login link should be sent
}

#[api_v2_operation(
    summary = "/org/members",
    operation_id = "org-users-create",
    tags(Private),
    description = "Create a new IAM user for the tenant. Sends an invite link via WorkOs"
)]
#[post("/members")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateTenantUserRequest>,
    auth: WorkOsAuthContext,
) -> JsonApiResponse<api_wire_types::OrganizationMember> {
    let auth = auth.check_permissions(vec![TenantPermission::Admin])?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let CreateTenantUserRequest {
        email,
        role_id,
        redirect_url,
    } = request.into_inner();
    let (user, role) = state
        .db_pool
        .db_transaction(move |conn| TenantUser::create(conn, email.into(), tenant_id, role_id))
        .await?;

    // TODO use a different email template for inviting a teammate
    create_and_send_magic_link(&state, &user.email.0, &redirect_url).await?;

    let result = api_wire_types::OrganizationMember::from_db((user, role));
    ResponseData::ok(result).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantUserRequest {
    role_id: Option<TenantRoleId>,
}

#[api_v2_operation(
    summary = "/org/members",
    operation_id = "org-users-patch",
    tags(Private),
    description = "Updates the provided user."
)]
#[patch("/members/{tenant_user_id}")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantUserRequest>,
    user_id: web::Path<TenantUserId>,
    auth: WorkOsAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_permissions(vec![TenantPermission::Admin])?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let UpdateTenantUserRequest { role_id } = request.into_inner();
    let update = TenantUserUpdate {
        tenant_role_id: role_id,
        ..TenantUserUpdate::default()
    };
    state
        .db_pool
        .db_transaction(move |conn| TenantUser::update(conn, &tenant_id, &user_id, update))
        .await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    summary = "/org/members/deactivate",
    operation_id = "org-users-deactivate",
    tags(Private),
    description = "Updates the provided user."
)]
#[post("/members/{tenant_user_id}/deactivate")]
async fn deactivate(
    state: web::Data<State>,
    user_id: web::Path<TenantUserId>,
    auth: WorkOsAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_permissions(vec![TenantPermission::Admin])?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let user_id = user_id.into_inner();

    if let Some(tenant_user) = auth.tenant_user() {
        if tenant_user.id == user_id {
            return Err(TenantError::CannotDeactivateCurrentUser.into());
        }
    }

    let update = TenantUserUpdate {
        deactivated_at: Some(Some(Utc::now())),
        ..TenantUserUpdate::default()
    };
    state
        .db_pool
        .db_transaction(move |conn| TenantUser::update(conn, &tenant_id, &user_id, update))
        .await?;

    EmptyResponse::ok().json()
}

impl DbToApi<(TenantUser, TenantRole)> for api_wire_types::OrganizationMember {
    fn from_db((user, role): (TenantUser, TenantRole)) -> Self {
        let TenantUser {
            id,
            email,
            last_login_at,
            created_at,
            ..
        } = user;
        let TenantRole {
            name: role_name,
            id: role_id,
            ..
        } = role;
        Self {
            id,
            email: email.0,
            last_login_at,
            created_at,
            role_name,
            role_id,
        }
    }
}
