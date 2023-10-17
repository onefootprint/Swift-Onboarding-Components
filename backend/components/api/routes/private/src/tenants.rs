use actix_web::{get, web};
use api_core::auth::tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard};
use api_core::errors::ApiResult;
use api_core::types::{JsonApiResponse, ResponseData};
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::PrivateTenantFilters;
use db::models::tenant::{PrivateTenantFilters as DbPrivateTenantFilters, Tenant};
use itertools::Itertools;

#[get("/private/tenants")]
async fn get(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    filters: web::Query<PrivateTenantFilters>,
) -> JsonApiResponse<Vec<api_wire_types::PrivateTenant>> {
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
        .await??;

    let results = orgs
        .into_iter()
        .map(|org| (counts.remove(&org.id), org))
        .map(api_wire_types::PrivateTenant::from_db)
        .sorted_by_key(|org| (org.is_live, org.num_live_vaults, org.created_at))
        .rev()
        .collect();

    ResponseData::ok(results).json()
}
