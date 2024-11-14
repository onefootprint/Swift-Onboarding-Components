use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantApiKeyAuth;
use crate::auth::tenant::TenantGuard;
use crate::State;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use db::models::manual_review::ManualReview;
use db::models::manual_review::ManualReviewFilters;
use db::models::scoped_vault::ScopedVault;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "View basic details for a business. See the APIs under `/businesses/{fp_bid}/vault` for information on reading vault data.",
    tags(Businesses, PublicApi)
)]
#[get("/businesses/{fp_bid:fp_[_A-Za-z0-9]*}")]
pub async fn get(
    state: web::Data<State>,
    fp_bid: FpIdPath,
    auth: TenantApiKeyAuth,
) -> ApiResponse<api_wire_types::Business> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_bid = fp_bid.into_inner();

    let (sv, mrs) = state
        .db_query(move |conn| {
            let sv = ScopedVault::get(conn, (&fp_bid, &tenant_id, is_live))?;
            let mr_filters = ManualReviewFilters::get_active();
            let mrs = ManualReview::get(conn, &sv.id, mr_filters)?;
            Ok((sv, mrs))
        })
        .await?;

    let result = api_wire_types::Business::from_db((sv, mrs));
    Ok(result)
}
