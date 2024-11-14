use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::FpResult;
use api_core::State;
use db::models::business_owner::BusinessOwner;
use db::models::scoped_vault::ScopedVault;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Gets the beneficial owners of a business entity.",
    tags(EntityDetails, Private)
)]
#[get("/entities/{fp_id}/businesses")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
) -> ApiListResponse<api_wire_types::PrivateOwnedBusiness> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let businesses = state
        .db_query(move |conn| -> FpResult<_> {
            let su = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let businesses = BusinessOwner::list_owned_businesses(conn, &su.vault_id, &tenant_id)?;
            Ok(businesses)
        })
        .await?;

    let results = businesses
        .into_iter()
        .map(api_wire_types::PrivateOwnedBusiness::from_db)
        .collect();
    Ok(results)
}
