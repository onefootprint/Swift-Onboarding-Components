use actix_web::get;
use actix_web::web;
use actix_web::web::Json;
use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::tenant::FirmEmployeeGuard;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::ApiResponse;
use api_core::FpResult;
use api_core::State;
use api_wire_types::PrivateTenantFilters;
use db::models::tenant::PrivateTenantFilters as DbPrivateTenantFilters;
use db::models::tenant::Tenant;
use itertools::Itertools;

#[get("/private/tenants")]
async fn get(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    pagination: web::Query<OffsetPaginationRequest>,
    filters: web::Query<PrivateTenantFilters>,
) -> ApiResponse<Json<OffsetPaginatedResponse<api_wire_types::PrivateTenant>>> {
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
        .db_query(move |conn| -> FpResult<_> {
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

    let pagination = pagination.db_pagination(&state);
    let (results, next_page) = pagination.results(results);

    let result = OffsetPaginatedResponse::ok(results, next_page, count as i64);
    Ok(Json(result))
}
