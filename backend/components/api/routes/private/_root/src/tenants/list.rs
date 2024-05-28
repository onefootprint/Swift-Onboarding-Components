use actix_web::{get, web, web::Json};
use api_core::{
    auth::tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard},
    errors::ApiResult,
    types::{OffsetPaginatedResponse, OffsetPaginationRequest},
    utils::db2api::DbToApi,
    State,
};
use api_wire_types::PrivateTenantFilters;
use db::{
    models::tenant::{PrivateTenantFilters as DbPrivateTenantFilters, Tenant},
    OffsetPagination,
};
use itertools::Itertools;

#[get("/private/tenants")]
async fn get(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    pagination: web::Query<OffsetPaginationRequest>,
    filters: web::Query<PrivateTenantFilters>,
) -> ApiResult<Json<OffsetPaginatedResponse<api_wire_types::PrivateTenant>>> {
    auth.check_guard(FirmEmployeeGuard::Any)?;
    let PrivateTenantFilters {
        search,
        is_live,
        only_with_domains,
    } = filters.into_inner();

    let filters = DbPrivateTenantFilters {
        search,
        is_live,
        only_with_domains,
    };

    let (orgs, mut counts) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let orgs = Tenant::private_list(conn, filters)?;
            let counts = Tenant::private_user_counts(conn)?;
            Ok((orgs, counts))
        })
        .await?;

    let count = orgs.len();
    let page = pagination.page;
    let page_size = pagination.page_size(&state);

    let results = orgs
        .into_iter()
        .map(|org| (counts.remove(&org.id), org))
        .map(api_wire_types::PrivateTenant::from_db)
        .sorted_by_key(|org| (org.is_live, org.num_live_vaults, org.created_at))
        .rev()
        .skip(page_size * page.unwrap_or_default())
        .collect_vec();

    let pagination = OffsetPagination::new(page, page_size);
    let (results, next_page) = pagination.results(results);

    let result = OffsetPaginatedResponse::ok(results, next_page, count as i64);
    Ok(Json(result))
}
