use std::collections::HashMap;

use crate::{
    auth::{
        tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard, TenantSessionAuth},
        Either,
    },
    get,
    types::{response::ResponseData, JsonApiResponse},
    State,
};
use api_core::{
    errors::{ApiResult, AssertionError},
    utils::{
        db2api::DbToApi,
        dupes,
        fp_id_path::FpIdPath,
        vault_wrapper::{TenantVw, VaultWrapper},
    },
};
use db::models::scoped_vault::ScopedVault;
use newtypes::ScopedVaultId;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "Lists information about other vaults with duplicate information for a footprint vault.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/dupes")]
pub async fn get_dupes(
    state: web::Data<State>,
    request: FpIdPath,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<api_wire_types::Dupes> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let (dupes, vws) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

            let dupes = dupes::get_dupes(conn, &sv.id)?;
            let vaults = dupes
                .same_tenant
                .iter()
                .map(|d| (d.scoped_vault.clone(), d.vault.clone()))
                .collect();

            let vws: HashMap<ScopedVaultId, TenantVw> =
                VaultWrapper::multi_get_for_tenant(conn, vaults, None)?;

            Ok((dupes, vws))
        })
        .await?;

    let mut decrypted_results =
        get::search::decrypt_visible_attrs(&state, &auth, vws.values().collect()).await?;

    let other_tenant_dupes = api_wire_types::OtherTenantDupes::from_db(dupes.other_tenant.clone());
    let same_tenant_dupes = dupes
        .same_tenant
        .into_iter()
        .map(|d| {
            let decrypted_data = decrypted_results.remove(&d.scoped_vault.id).unwrap_or_default();
            let vw = vws
                .get(&d.scoped_vault.id)
                .ok_or(AssertionError("VW not found"))?;
            Ok((d, vw, decrypted_data))
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .map(|(d, vw, data)| api_wire_types::SameTenantDupe::from_db((d, vw, &auth, data)))
        .collect();

    ResponseData::ok(api_wire_types::Dupes::from_db((
        same_tenant_dupes,
        other_tenant_dupes,
    )))
    .json()
}
