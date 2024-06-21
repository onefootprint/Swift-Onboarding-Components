use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::JsonApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Gets the beneficial owners of a business entity.",
    tags(EntityDetails, Private)
)]
#[get("/entities/{fp_id}/business_owners")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
) -> JsonApiListResponse<api_wire_types::PrivateBusinessOwner> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let (vw, sv) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw: TenantVw<Business> = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            Ok((vw, sv))
        })
        .await?;

    let decrypted_bos = vw.decrypt_business_owners(&state, &sv.tenant_id).await?;

    let results = decrypted_bos
        .into_iter()
        .sorted_by_key(|bo| {
            (
                bo.kind,
                bo.ownership_stake,
                bo.first_name.as_ref().map(|n| n.leak_to_string()),
                bo.last_name.as_ref().map(|n| n.leak_to_string()),
            )
        })
        .map(api_wire_types::PrivateBusinessOwner::from_db)
        .collect();
    Ok(results)
}
