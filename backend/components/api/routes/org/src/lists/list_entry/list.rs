use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::errors::ApiResult;
use api_core::types::JsonApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::{
    ApiError,
    State,
};
use crypto::aead::{
    AeadSealedBytes,
    SealingKey,
};
use db::models::list::List;
use db::models::list_entry::ListEntry;
use db::models::tenant::Tenant;
use newtypes::{
    ListId,
    PiiBytes,
    PiiString,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Retrieves all entries of a list",
    tags(Lists, Organization, Private)
)]
#[actix::get("/org/lists/{list_id}/entries")]
pub async fn entries_for_list(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    list_id: web::Path<ListId>,
) -> JsonApiListResponse<api_wire_types::ListEntry> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let (tenant, list, entries) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let tenant = Tenant::get(conn, &tenant_id)?;
            let list = List::get(conn, &tenant_id, is_live, &list_id)?;
            let entries = ListEntry::list(conn, &list_id)?;
            Ok((tenant, list, entries))
        })
        .await?;

    let decrypted_list_key = SealingKey::new(
        state
            .enclave_client
            .decrypt_to_pii_bytes(&list.e_data_key.into(), &tenant.e_private_key)
            .await?
            .into_leak(),
    )?;
    let decrypted_data = entries
        .iter()
        .map(|e| {
            decrypted_list_key
                .unseal_bytes(AeadSealedBytes(e.e_data.clone().0))
                .map_err(ApiError::from)
                .map(PiiBytes::new)
                .and_then(|b| PiiString::try_from(b).map_err(ApiError::from))
        })
        .collect::<Result<Vec<_>, _>>()?;

    Ok(entries
        .into_iter()
        .zip(decrypted_data.into_iter())
        .map(api_wire_types::ListEntry::from_db)
        .collect())
}
