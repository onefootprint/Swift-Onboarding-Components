use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginatedResponseMetaNoCount;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::web::Json;
use api_core::ApiResponse;
use api_core::State;
use db::models::business_owner::BusinessOwner;
use db::models::business_owner::BusinessOwnerQuery;
use db::models::scoped_vault::ScopedVault;
use newtypes::preview_api;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

type BusinessOwnersListResponse =
    OffsetPaginatedResponse<api_wire_types::BusinessOwner, OffsetPaginatedResponseMetaNoCount>;

#[api_v2_operation(
    description = "Gets the beneficial owners of a business.",
    tags(Businesses, Preview)
)]
#[get("/businesses/{fp_bid}/owners")]
pub async fn get(
    state: web::Data<State>,
    fp_bid: FpIdPath,
    auth: TenantApiKeyGated<preview_api::ListBusinessOwners>,
    pagination: web::Query<OffsetPaginationRequest>,
) -> ApiResponse<Json<BusinessOwnersListResponse>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_bid = fp_bid.into_inner();

    let pagination = pagination.db_pagination(&state);
    let (bos, next_page) = state
        .db_query(move |conn| {
            let sb = ScopedVault::get(conn, (&fp_bid, &tenant_id, is_live))?;
            let query = BusinessOwnerQuery {
                bv_id: &sb.vault_id,
                tenant_id: &tenant_id,
            };
            let (bos, next_page) = BusinessOwner::list(conn, query, pagination)?;
            Ok((bos, next_page))
        })
        .await?;

    let results = bos
        .into_iter()
        .map(api_wire_types::BusinessOwner::from_db)
        .collect();
    let response = BusinessOwnersListResponse::ok_no_count(results, next_page);
    Ok(Json(response))
}
