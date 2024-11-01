use api_core::auth::tenant::PartnerTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantOrPartnerTenantSessionAuth;
use api_core::errors::tenant::TenantError;
use api_core::types::ApiResponse;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::utils::headers::InsightHeaders;
use api_core::FpResult;
use api_core::State;
use api_wire_types::OrgRoleFilters;
use db::models::audit_event::AuditEvent;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::tenant_role::TenantRole;
use db::models::tenant_role::TenantRoleListFilters;
use newtypes::AuditEventDetail;
use newtypes::OrgIdentifier;
use newtypes::TenantRoleId;
use newtypes::TenantRoleKind;
use newtypes::TenantRoleKindDiscriminant;
use paperclip::actix::web;
use paperclip::actix::web::Json;

pub type RolesResponse = Json<OffsetPaginatedResponse<api_wire_types::OrganizationRole>>;

pub async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgRoleFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantOrPartnerTenantSessionAuth,
) -> ApiResponse<RolesResponse> {
    let auth = auth.check_guard(TenantGuard::Read, PartnerTenantGuard::Read)?;
    let authed_org_ident = auth.org_identifier().clone_into();
    let is_live = auth.is_live()?;

    let pagination = pagination.db_pagination(&state);
    let OrgRoleFilters { search, kind } = filters.into_inner();

    let (results, next_page, count) = state
        .db_query(move |conn| -> FpResult<_> {
            let filters = TenantRoleListFilters {
                org_ident: (&authed_org_ident).into(),
                scopes: None,
                search,
                kind,
                is_live,
            };
            let (results, next_page) = TenantRole::list_active(conn, &filters, pagination)?;
            let count = TenantRole::count_active(conn, &filters)?;
            Ok((results, next_page, count))
        })
        .await?;

    let results = results
        .into_iter()
        .map(api_wire_types::OrganizationRole::from_db)
        .collect();
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}

pub async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateTenantRoleRequest>,
    auth: TenantOrPartnerTenantSessionAuth,
    insight: InsightHeaders,
) -> ApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();
    let is_live = auth.is_live()?;
    let db_actor = auth.actor().clone();

    let api_wire_types::CreateTenantRoleRequest { name, scopes, kind } = request.into_inner();

    if kind.tenant_kind() != (&authed_org_ident).into() {
        return Err(TenantError::InvalidTenantRoleKind.into());
    }

    let kind = match kind {
        TenantRoleKindDiscriminant::ApiKey => TenantRoleKind::ApiKey { is_live },
        TenantRoleKindDiscriminant::DashboardUser => TenantRoleKind::DashboardUser,
        TenantRoleKindDiscriminant::CompliancePartnerDashboardUser => {
            TenantRoleKind::CompliancePartnerDashboardUser
        }
    };

    let result = state
        .db_transaction(move |conn| -> FpResult<_> {
            let new_tenant_role =
                TenantRole::create(conn, &authed_org_ident, &name, scopes.clone(), false, kind)?;

            let detail = AuditEventDetail::CreateOrgRole {
                scopes,
                is_live,
                tenant_role_id: new_tenant_role.id.clone(),
            };

            // we will only create audit events for tenant roles - we'll skip partner roles
            if let OrgIdentifier::TenantId(tenant_id) = authed_org_ident {
                let insight_event_id = CreateInsightEvent::from(insight).insert_with_conn(conn)?.id;
                let audit_event = NewAuditEvent {
                    principal_actor: db_actor.into(),
                    insight_event_id,
                    tenant_id,
                    detail,
                };
                AuditEvent::create(conn, audit_event)?;
            }
            Ok(new_tenant_role)
        })
        .await?;
    Ok(api_wire_types::OrganizationRole::from_db(result))
}

pub async fn patch(
    state: web::Data<State>,
    request: web::Json<api_wire_types::UpdateTenantRoleRequest>,
    role_id: web::Path<TenantRoleId>,
    auth: TenantOrPartnerTenantSessionAuth,
    insight: InsightHeaders,
) -> ApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();
    let api_wire_types::UpdateTenantRoleRequest { name, scopes } = request.into_inner();
    let is_live = auth.is_live()?;
    let db_actor = auth.actor().clone();

    let result = state
        .db_transaction(move |conn| {
            if let OrgIdentifier::TenantId(tenant_id) = authed_org_ident.clone() {
                let insight_event_id = CreateInsightEvent::from(insight).insert_with_conn(conn)?.id;
                let prev_tenant_role = TenantRole::get(conn, &role_id.clone())?;
                let detail = AuditEventDetail::UpdateOrgRole {
                    prev_scopes: prev_tenant_role.scopes,
                    new_scopes: scopes.clone().unwrap_or_default(),
                    is_live,
                    tenant_role_id: role_id.clone(),
                };

                let audit_event = NewAuditEvent {
                    principal_actor: db_actor.into(),
                    insight_event_id,
                    tenant_id,
                    detail,
                };
                AuditEvent::create(conn, audit_event)?;
            }
            TenantRole::update(conn, &authed_org_ident, &role_id, name, scopes)
        })
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    Ok(result)
}

pub async fn deactivate(
    state: web::Data<State>,
    role_id: web::Path<TenantRoleId>,
    auth: TenantOrPartnerTenantSessionAuth,
    _insight: InsightHeaders,
) -> ApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();

    let result = state
        .db_transaction(move |conn| TenantRole::deactivate(conn, &role_id, &authed_org_ident))
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    Ok(result)
}
