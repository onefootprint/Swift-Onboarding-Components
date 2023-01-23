use crate::auth::tenant::AuthActor;
use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantUserAuthContext;
use crate::errors::tenant::TenantError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::org::auth::magic_link::create_and_send_magic_link;
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::types::PaginatedResponseData;
use crate::types::PaginationRequest;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_wire_types::OrgMemberFilters;
use chrono::Utc;
use db::models::tenant_user::TenantUserListFilters;
use db::models::tenant_user::{TenantUser, TenantUserUpdate};
use newtypes::OrgMemberEmail;
use newtypes::TenantRoleId;
use newtypes::TenantUserId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json};

#[api_v2_operation(
    tags(OrgSettings),
    description = "Returns a list of dashboard members for the tenant."
)]
#[get("/org/members")]
async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgMemberFilters>,
    pagination: web::Query<PaginationRequest<OrgMemberEmail>>,
    auth: TenantUserAuthContext,
) -> actix_web::Result<
    Json<PaginatedResponseData<Vec<api_wire_types::OrganizationMember>, OrgMemberEmail>>,
    ApiError,
> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let cursor = pagination.cursor.clone();
    let page_size = pagination.page_size(&state);
    let OrgMemberFilters {
        role_ids,
        search,
        is_invite_pending,
    } = filters.into_inner();
    let role_ids = role_ids.map(|r_ids| r_ids.0);

    let tenant_id = tenant.id.clone();
    let (results, count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let filters = TenantUserListFilters {
                tenant_id: &tenant_id,
                cursor,
                page_size: (page_size + 1) as i64,
                only_active: true,
                role_ids,
                search,
                is_invite_pending,
            };
            let result = TenantUser::list(conn, &filters)?;
            let count = TenantUser::count(conn, &filters)?;
            Ok((result, count))
        })
        .await??;

    let cursor = pagination
        .cursor_item(&state, &results)
        .map(|x| x.0.email.clone());
    let results = results
        .into_iter()
        .take(page_size)
        .map(api_wire_types::OrganizationMember::from_db)
        .collect::<Vec<api_wire_types::OrganizationMember>>();
    Ok(Json(PaginatedResponseData::ok(results, cursor, Some(count))))
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct CreateTenantUserRequest {
    email: OrgMemberEmail,
    role_id: TenantRoleId,
    redirect_url: String, // The URL to the dashboard where the invite login link should be sent
    first_name: Option<String>,
    last_name: Option<String>,
}

#[api_v2_operation(
    tags(OrgSettings),
    description = "Create a new IAM user for the tenant. Sends an invite link via WorkOs"
)]
#[post("/org/members")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateTenantUserRequest>,
    auth: TenantUserAuthContext,
) -> JsonApiResponse<api_wire_types::OrganizationMember> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let CreateTenantUserRequest {
        email,
        role_id,
        redirect_url,
        first_name,
        last_name,
    } = request.into_inner();
    let (user, role) = state
        .db_pool
        .db_transaction(move |conn| {
            TenantUser::create(conn, email, tenant_id, role_id, first_name, last_name)
        })
        .await?;

    // TODO use a different email template for inviting a teammate
    create_and_send_magic_link(&state, &user.email.0, &redirect_url).await?;

    let result = api_wire_types::OrganizationMember::from_db((user, role));
    ResponseData::ok(result).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantUserRequest {
    role_id: Option<TenantRoleId>,
    first_name: Option<String>,
    last_name: Option<String>,
}

#[api_v2_operation(tags(OrgSettings), description = "Updates the provided user.")]
#[patch("/org/members/{tenant_user_id}")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantUserRequest>,
    user_id: web::Path<TenantUserId>,
    auth: TenantUserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let user_id = user_id.into_inner();
    let UpdateTenantUserRequest {
        role_id,
        first_name,
        last_name,
    } = request.into_inner();

    if first_name.is_some() || last_name.is_some() {
        let actor = auth.actor();
        if let AuthActor::TenantUser(tenant_user_id) = actor {
            if tenant_user_id != user_id {
                return Err(
                    TenantError::ValidationError("Cannot change another user's name".to_owned()).into(),
                );
            }
        }
    }

    let update = TenantUserUpdate {
        tenant_role_id: role_id,
        first_name,
        last_name,
        ..TenantUserUpdate::default()
    };
    state
        .db_pool
        .db_transaction(move |conn| TenantUser::update(conn, &tenant_id, &user_id, update))
        .await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(tags(OrgSettings), description = "Deactivates the provided user.")]
#[post("/org/members/{tenant_user_id}/deactivate")]
async fn deactivate(
    state: web::Data<State>,
    user_id: web::Path<TenantUserId>,
    auth: TenantUserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let user_id = user_id.into_inner();

    let actor = auth.actor();
    if let AuthActor::TenantUser(tenant_user_id) = actor {
        if tenant_user_id == user_id {
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
