use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::errors::ApiError;
use crate::get::search::decrypt_visible_attrs;
use crate::types::{
    JsonApiResponse,
    ResponseData,
};
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::serializers::entity_attributes;
use api_core::utils::fp_id_path::FpIdPath;
use api_wire_types::EntityAttribute;
use db::models::scoped_vault::ScopedVault;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

#[api_v2_operation(
    description = "View the vault data for a specific entity (business or user)",
    tags(Entities, Private)
)]
#[get("/entities/{fp_id}/data")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
    filters: web::Query<api_wire_types::GetHistoricalDataRequest>,
) -> JsonApiResponse<Vec<EntityAttribute>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let fp_id = fp_id.into_inner();
    let is_live = auth.is_live()?;

    let api_wire_types::GetHistoricalDataRequest { seqno } = filters.into_inner();

    let vw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw = VaultWrapper::build_for_tenant_version(conn, &sv.id, seqno)?;
            Ok(vw)
        })
        .await?;

    let decrypted_results = decrypt_visible_attrs(&state, &auth, vec![&vw])
        .await?
        .into_values()
        .next()
        .unwrap_or_default();

    let results = entity_attributes(&vw, &auth, decrypted_results);
    ResponseData::ok(results).json()
}
