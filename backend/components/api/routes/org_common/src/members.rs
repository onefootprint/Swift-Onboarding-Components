use api_core::auth::tenant::AuthActor;
use api_core::auth::tenant::PartnerTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantOrPartnerTenantSessionAuth;
use api_core::errors::tenant::TenantError;
use api_core::types::ApiResponse;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::magic_link::create_magic_link;
use api_core::FpResult;
use api_core::State;
use api_wire_types::OrgMemberFilters;
use chrono::Utc;
use db::helpers::TenantOrPartnerTenantRef;
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_rolebinding::TenantRolebindingFilters;
use db::models::tenant_rolebinding::TenantRolebindingUpdate;
use db::models::tenant_user::TenantUser;
use newtypes::OrgIdentifierRef;
use newtypes::OrgMemberEmail;
use newtypes::TenantUserId;
use paperclip::actix::web;
use paperclip::actix::web::Json;


pub async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgMemberFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantOrPartnerTenantSessionAuth,
) -> ApiResponse<Json<OffsetPaginatedResponse<api_wire_types::OrganizationMember>>> {
    let auth = auth.check_guard(TenantGuard::Read, PartnerTenantGuard::Read)?;
    let authed_org_ident = auth.org_identifier().clone_into();

    let pagination = pagination.db_pagination(&state);
    let OrgMemberFilters {
        role_ids,
        search,
        is_invite_pending,
    } = filters.into_inner();
    let role_ids = role_ids.map(|r_ids| r_ids.0);

    let (results, next_page, count) = state
        .db_query(move |conn| -> FpResult<_> {
            let filters = TenantRolebindingFilters {
                org_id: (&authed_org_ident).into(),
                only_active: true,
                role_ids,
                search,
                is_invite_pending,
            };
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

pub async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateTenantUserRequest>,
    auth: TenantOrPartnerTenantSessionAuth,
    _insight: InsightHeaders,
) -> ApiResponse<api_wire_types::OrganizationMember> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();
    let actor = auth.actor();
    let org_name = match auth.org() {
        TenantOrPartnerTenantRef::Tenant(t) => t.name.clone(),
        TenantOrPartnerTenantRef::PartnerTenant(pt) => pt.name.clone(),
    };

    let user_id = actor.tenant_user_id()?.clone();

    let api_wire_types::CreateTenantUserRequest {
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
        .db_transaction(move |conn| -> FpResult<_> {
            let inviter = TenantUser::get(conn, &user_id)?;
            let user = TenantUser::get_and_update_or_create(conn, email2, first_name, last_name)?;
            let (rb, role) = TenantRolebinding::create(conn, user.id.clone(), role_id, &authed_org_ident)?;
            Ok((inviter, user, rb, role))
        })
        .await?;

    if !omit_email_invite {
        let link = create_magic_link(&state, &email.0, &redirect_url, false).await?;
        let inviter = inviter.first_name.unwrap_or(inviter.email.0);
        state
            .sendgrid_client
            .send_dashboard_invite_email(&state, email.0, inviter, org_name, link)
            .await?;
    }

    let result = api_wire_types::OrganizationMember::from_db((user, rb, role));
    Ok(result)
}

pub async fn patch(
    state: web::Data<State>,
    request: web::Json<api_wire_types::UpdateTenantRolebindingRequest>,
    tu_id: web::Path<TenantUserId>,
    auth: TenantOrPartnerTenantSessionAuth,
    _insight: InsightHeaders,
) -> ApiResponse<api_wire_types::OrganizationMember> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();
    let actor = auth.actor();

    let tu_id = tu_id.into_inner();
    let api_wire_types::UpdateTenantRolebindingRequest { role_id } = request.into_inner();

    if let AuthActor::TenantUser(tenant_user_id) = actor {
        if tenant_user_id == tu_id {
            return Err(TenantError::CannotEditCurrentUser.into());
        }
    }

    let rolebinding_update = TenantRolebindingUpdate {
        tenant_role_id: role_id,
        ..Default::default()
    };
    let (user, rb, role) = state
        .db_transaction(move |conn| -> FpResult<_> {
            let org_ref: OrgIdentifierRef<'_> = (&authed_org_ident).into();
            let (user, _, role, _) = TenantRolebinding::get(conn, (&tu_id, org_ref))?;
            let rb = TenantRolebinding::update(conn, (&tu_id, org_ref), rolebinding_update)?;
            Ok((user, rb, role))
        })
        .await?;

    let result = api_wire_types::OrganizationMember::from_db((user, rb, role));
    Ok(result)
}

pub async fn deactivate(
    state: web::Data<State>,
    tu_id: web::Path<TenantUserId>,
    auth: TenantOrPartnerTenantSessionAuth,
    _insight: InsightHeaders,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();
    let actor = auth.actor();

    let tu_id = tu_id.into_inner();
    if let AuthActor::TenantUser(tenant_user_id) = actor {
        if tenant_user_id == tu_id {
            return Err(TenantError::CannotEditCurrentUser.into());
        }
    }

    let update = TenantRolebindingUpdate {
        deactivated_at: Some(Some(Utc::now())),
        ..TenantRolebindingUpdate::default()
    };
    state
        .db_transaction(move |conn| -> FpResult<_> {
            let org_ref: OrgIdentifierRef<'_> = (&authed_org_ident).into();
            TenantRolebinding::update(conn, (&tu_id, org_ref), update)?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
