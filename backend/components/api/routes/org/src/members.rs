use crate::{
    auth::tenant::{AuthActor, CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::{tenant::TenantError, ApiResult},
    types::{EmptyResponse, JsonApiResponse, OffsetPaginatedResponse, OffsetPaginationRequest, ResponseData},
    utils::{db2api::DbToApi, magic_link::create_magic_link},
    State,
};
use api_wire_types::OrgMemberFilters;
use chrono::Utc;
use db::{
    models::{
        tenant_rolebinding::{TenantRolebinding, TenantRolebindingFilters, TenantRolebindingUpdate},
        tenant_user::TenantUser,
    },
    OffsetPagination,
};
use newtypes::{email::Email, OrgMemberEmail, TenantRoleId, TenantUserId};
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json, Apiv2Schema};

#[api_v2_operation(
    tags(Members, OrgSettings, Private),
    description = "Returns a list of dashboard members for the tenant."
)]
#[get("/org/members")]
async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgMemberFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantSessionAuth,
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
    let (results, next_page, count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let filters = TenantRolebindingFilters {
                t_pt_id: (&tenant_id).into(),
                only_active: true,
                role_ids,
                search,
                is_invite_pending,
            };
            let pagination = OffsetPagination::new(page, page_size);
            let (results, next_page) = TenantRolebinding::list(conn, &filters, pagination)?;
            let count = TenantRolebinding::count(conn, &filters)?;
            Ok((results, next_page, count))
        })
        .await?;

    let results = results
        .into_iter()
        .map(api_wire_types::OrganizationMember::from_db)
        .collect();
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct CreateTenantUserRequest {
    email: Email,
    role_id: TenantRoleId,
    redirect_url: String, // The URL to the dashboard where the invite login link should be sent
    first_name: Option<String>,
    last_name: Option<String>,
    #[serde(default)]
    /// A feature only used by employees to allow inviting users to a tenant without sending them an email
    omit_email_invite: bool,
}

#[api_v2_operation(
    tags(Members, OrgSettings, Private),
    description = "Create a new IAM user for the tenant. Sends an invite link via WorkOs"
)]
#[post("/org/members")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateTenantUserRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationMember> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();

    let user_id = auth.actor().tenant_user_id()?.clone();
    let tenant_id = tenant.id.clone();
    let CreateTenantUserRequest {
        email,
        role_id,
        redirect_url,
        first_name,
        last_name,
        omit_email_invite,
    } = request.into_inner();

    let email = OrgMemberEmail::try_from(email)?;
    let email2 = email.clone();
    let (inviter, user, rb, role) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let inviter = TenantUser::get(conn, &user_id)?;
            let user = TenantUser::get_and_update_or_create(conn, email2, first_name, last_name)?;
            let (rb, role) = TenantRolebinding::create(conn, user.id.clone(), role_id, &tenant_id)?;
            Ok((inviter, user, rb, role))
        })
        .await?;

    if !omit_email_invite {
        let link = create_magic_link(&state, &email.0, &redirect_url, false).await?;
        let inviter = inviter.first_name.unwrap_or(inviter.email.0);
        state
            .sendgrid_client
            .send_dashboard_invite_email(&state, email.0, inviter, tenant.name.clone(), link)
            .await?;
    }

    let result = api_wire_types::OrganizationMember::from_db((user, rb, role));
    ResponseData::ok(result).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantRolebindingRequest {
    role_id: Option<TenantRoleId>,
}

#[api_v2_operation(
    tags(Members, OrgSettings, Private),
    description = "Updates the provided member."
)]
#[patch("/org/members/{tenant_user_id}")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantRolebindingRequest>,
    tu_id: web::Path<TenantUserId>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationMember> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant_id = auth.tenant().id.clone();
    let tu_id = tu_id.into_inner();
    let UpdateTenantRolebindingRequest { role_id } = request.into_inner();

    if let AuthActor::TenantUser(tenant_user_id) = auth.actor() {
        if tenant_user_id == tu_id {
            return Err(TenantError::CannotEditCurrentUser.into());
        }
    }

    let rolebinding_update = TenantRolebindingUpdate {
        tenant_role_id: role_id,
        ..Default::default()
    };
    let (user, rb, role) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (user, _, role, _) = TenantRolebinding::get(conn, (&tu_id, &tenant_id))?;
            let rb = TenantRolebinding::update(conn, (&tu_id, &tenant_id), rolebinding_update)?;
            Ok((user, rb, role))
        })
        .await?;

    let result = api_wire_types::OrganizationMember::from_db((user, rb, role));
    ResponseData::ok(result).json()
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
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant_id = auth.tenant().id.clone();
    let tu_id = tu_id.into_inner();
    if let AuthActor::TenantUser(tenant_user_id) = auth.actor() {
        if tenant_user_id == tu_id {
            return Err(TenantError::CannotEditCurrentUser.into());
        }
    }

    let update = TenantRolebindingUpdate {
        deactivated_at: Some(Some(Utc::now())),
        ..TenantRolebindingUpdate::default()
    };
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            TenantRolebinding::update(conn, (&tu_id, &tenant_id), update)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
