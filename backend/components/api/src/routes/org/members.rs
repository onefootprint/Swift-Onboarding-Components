use crate::auth::tenant::Any;
use crate::auth::tenant::AuthActor;
use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantUserAuthContext;
use crate::errors::tenant::TenantError;
use crate::errors::ApiResult;
use crate::org::auth::magic_link::create_and_send_magic_link;
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::types::OffsetPaginatedResponse;
use crate::types::OffsetPaginationRequest;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_wire_types::OrgMemberFilters;
use chrono::Utc;
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_rolebinding::TenantRolebindingFilters;
use db::models::tenant_rolebinding::TenantRolebindingUpdate;
use db::models::tenant_user::{TenantUser, TenantUserUpdate};
use newtypes::OrgMemberEmail;
use newtypes::TenantRoleId;
use newtypes::TenantRolebindingId;
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
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantUserAuthContext,
) -> ApiResult<Json<OffsetPaginatedResponse<api_wire_types::OrganizationMember>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let page = pagination.page;
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
            let filters = TenantRolebindingFilters {
                tenant_id: &tenant_id,
                page,
                page_size: page_size as i64,
                only_active: true,
                role_ids,
                search,
                is_invite_pending,
            };
            let result = TenantRolebinding::list(conn, &filters)?;
            let count = TenantRolebinding::count(conn, &filters)?;
            Ok((result, count))
        })
        .await??;

    let next_page = pagination.next_page(&state, results.len());
    let results = results
        .into_iter()
        .take(page_size)
        .map(api_wire_types::OrganizationMember::from_db)
        .collect::<Vec<api_wire_types::OrganizationMember>>();
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
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
    let (user, rb, role) = state
        .db_pool
        .db_transaction(move |conn| {
            TenantRolebinding::create(conn, email, role_id, tenant_id, first_name, last_name)
        })
        .await?;

    // TODO use a different email template for inviting a teammate
    create_and_send_magic_link(&state, &user.email.0, &redirect_url).await?;

    let result = api_wire_types::OrganizationMember::from_db((user, rb, role));
    ResponseData::ok(result).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantUserRequest {
    first_name: Option<String>,
    last_name: Option<String>,
}

#[api_v2_operation(tags(OrgSettings), description = "Updates the authed user.")]
#[patch("/org/members")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantUserRequest>,
    auth: TenantUserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
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
    state
        .db_pool
        .db_transaction(move |conn| TenantUser::update(conn, &user_id, user_update))
        .await?;

    EmptyResponse::ok().json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantRolebindingRequest {
    role_id: Option<TenantRoleId>,
}

#[api_v2_operation(tags(OrgSettings), description = "Updates the provided member.")]
#[patch("/org/members/{tenant_rb_id}")]
async fn patch_rb(
    state: web::Data<State>,
    request: web::Json<UpdateTenantRolebindingRequest>,
    rb_id: web::Path<TenantRolebindingId>,
    auth: TenantUserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let rb_id = rb_id.into_inner();
    let UpdateTenantRolebindingRequest { role_id } = request.into_inner();

    let rolebinding_update = TenantRolebindingUpdate {
        tenant_role_id: role_id,
        ..Default::default()
    };
    // TODO Don't allow changing the current user's role
    state
        .db_pool
        .db_transaction(move |conn| TenantRolebinding::update(conn, (&rb_id, &tenant_id), rolebinding_update))
        .await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(tags(OrgSettings), description = "Deactivates the provided user.")]
#[post("/org/members/{tenant_rb_id}/deactivate")]
async fn deactivate(
    state: web::Data<State>,
    rb_id: web::Path<TenantRolebindingId>,
    auth: TenantUserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let rb_id = rb_id.into_inner();

    let actor = auth.actor();

    let update = TenantRolebindingUpdate {
        deactivated_at: Some(Some(Utc::now())),
        ..TenantRolebindingUpdate::default()
    };
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            if let AuthActor::TenantUser(tenant_user_id) = actor {
                let (user, _, _, _) = TenantRolebinding::get(conn, (&rb_id, &tenant_id))?;
                if tenant_user_id == user.id {
                    return Err(TenantError::CannotDeactivateCurrentUser.into());
                }
            }
            TenantRolebinding::update(conn, (&rb_id, &tenant_id), update)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
