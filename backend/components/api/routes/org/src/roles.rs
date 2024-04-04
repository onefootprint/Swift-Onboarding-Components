use crate::{
    auth::tenant::TenantGuard,
    errors::ApiResult,
    types::{JsonApiResponse, OffsetPaginatedResponse, OffsetPaginationRequest, ResponseData},
    utils::db2api::DbToApi,
    State,
};
use api_core::{
    auth::tenant::{PartnerTenantGuard, TenantOrPartnerTenantSessionAuth},
    errors::tenant::TenantError,
};
use api_wire_types::OrgRoleFilters;
use db::{
    models::tenant_role::{TenantRole, TenantRoleListFilters},
    OffsetPagination,
};
use newtypes::{TenantRoleId, TenantRoleKind, TenantRoleKindDiscriminant, TenantScope};
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json, Apiv2Schema};

type RolesResponse = Json<OffsetPaginatedResponse<api_wire_types::OrganizationRole>>;

#[api_v2_operation(
    tags(Roles, OrgSettings, Private),
    description = "Returns a list of IAM roles for the tenant or partner tenant."
)]
#[get("/org/roles")]
async fn get(
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

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct CreateTenantRoleRequest {
    name: String,
    scopes: Vec<TenantScope>,
    kind: TenantRoleKindDiscriminant,
}

#[api_v2_operation(
    tags(Roles, OrgSettings, Private),
    description = "Create a new IAM role for the tenant or partner tenant."
)]
#[post("/org/roles")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateTenantRoleRequest>,
    auth: TenantOrPartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();
    let is_live = auth.is_live()?;

    let CreateTenantRoleRequest { name, scopes, kind } = request.into_inner();

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

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantRoleRequest {
    name: Option<String>,
    scopes: Option<Vec<TenantScope>>,
}

#[api_v2_operation(
    tags(Roles, OrgSettings, Private),
    description = "Updates the provided IAM role."
)]
#[patch("/org/roles/{tenant_role_id}")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantRoleRequest>,
    role_id: web::Path<TenantRoleId>,
    auth: TenantOrPartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings, PartnerTenantGuard::Admin)?;
    let authed_org_ident = auth.org_identifier().clone_into();

    let UpdateTenantRoleRequest { name, scopes } = request.into_inner();
    let result = state
        .db_pool
        .db_transaction(move |conn| TenantRole::update(conn, &authed_org_ident, &role_id, name, scopes))
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}

#[api_v2_operation(
    tags(Roles, OrgSettings, Private),
    description = "Deactivates the provided IAM role."
)]
#[post("/org/roles/{tenant_role_id}/deactivate")]
async fn deactivate(
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
