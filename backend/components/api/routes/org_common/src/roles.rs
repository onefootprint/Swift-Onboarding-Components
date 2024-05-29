use api_core::auth::tenant::{
    PartnerTenantGuard,
    TenantGuard,
    TenantOrPartnerTenantSessionAuth,
};
use api_core::errors::tenant::TenantError;
use api_core::errors::ApiResult;
use api_core::types::{
    JsonApiResponse,
    OffsetPaginatedResponse,
    OffsetPaginationRequest,
    ResponseData,
};
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::OrgRoleFilters;
use db::models::tenant_role::{
    TenantRole,
    TenantRoleListFilters,
};
use db::OffsetPagination;
use newtypes::{
    TenantRoleId,
    TenantRoleKind,
    TenantRoleKindDiscriminant,
};
use paperclip::actix::web;
use paperclip::actix::web::Json;

pub type RolesResponse = Json<OffsetPaginatedResponse<api_wire_types::OrganizationRole>>;

pub async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgRoleFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantOrPartnerTenantSessionAuth,
) -> ApiResult<RolesResponse> {
    let auth = auth.check_guard(TenantGuard::Read, PartnerTenantGuard::Read)?;
    let authed_org_ident = auth.org_identifier().clone_into();
    let is_live = auth.is_live()?;

    let page = pagination.page;
    let page_size = pagination.page_size(&state);
    let OrgRoleFilters { search, kind } = filters.into_inner();

    let (results, next_page, count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let filters = TenantRoleListFilters {
                org_ident: (&authed_org_ident).into(),
                scopes: None,
                search,
                kind,
                is_live,
            };
            let pagination = OffsetPagination::new(page, page_size);
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
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();
    let is_live = auth.is_live()?;

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
        .db_pool
        .db_query(move |conn| TenantRole::create(conn, &authed_org_ident, &name, scopes, false, kind))
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}

pub async fn patch(
    state: web::Data<State>,
    request: web::Json<api_wire_types::UpdateTenantRoleRequest>,
    role_id: web::Path<TenantRoleId>,
    auth: TenantOrPartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();

    let api_wire_types::UpdateTenantRoleRequest { name, scopes } = request.into_inner();
    let result = state
        .db_pool
        .db_transaction(move |conn| TenantRole::update(conn, &authed_org_ident, &role_id, name, scopes))
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}

pub async fn deactivate(
    state: web::Data<State>,
    role_id: web::Path<TenantRoleId>,
    auth: TenantOrPartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();

    let result = state
        .db_pool
        .db_transaction(move |conn| TenantRole::deactivate(conn, &role_id, &authed_org_ident))
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}
