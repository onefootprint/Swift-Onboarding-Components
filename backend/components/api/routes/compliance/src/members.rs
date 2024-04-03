use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    errors::ApiResult,
    types::{EmptyResponse, OffsetPaginatedResponse, OffsetPaginationRequest, ResponseData},
    utils::db2api::DbToApi,
    web::Json,
};
use api_wire_types::OrgMemberFilters;
use db::{
    models::tenant_rolebinding::{TenantRolebinding, TenantRolebindingFilters},
    OffsetPagination,
};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Returns a list of dashboard members for the partner tenant.",
    tags(Compliance, Private)
)]
#[actix::get("/compliance/members")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgMemberFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: PartnerTenantSessionAuth,
) -> ApiResult<Json<OffsetPaginatedResponse<api_wire_types::OrganizationMember>>> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();

    let page = pagination.page;
    let page_size = pagination.page_size(&state);
    let OrgMemberFilters {
        role_ids,
        search,
        is_invite_pending,
    } = filters.into_inner();
    let role_ids = role_ids.map(|r_ids| r_ids.0);

    let pt_id = pt.id.clone();
    let (results, next_page, count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let filters = TenantRolebindingFilters {
                org_id: (&pt_id).into(),
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

#[api_v2_operation(
    description = "Creates a new IAM user for the partner tenant. Sends an invite link via WorkOs.",
    tags(Compliance, Private)
)]
#[actix::post("/compliance/members")]
pub async fn post(
    _state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::Admin)?;
    let pt = auth.partner_tenant();
    dbg!(pt);

    ResponseData::ok(EmptyResponse {}).json()
}
