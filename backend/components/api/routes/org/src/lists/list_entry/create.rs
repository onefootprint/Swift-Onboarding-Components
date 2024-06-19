use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::errors::ApiResult;
use api_core::types::JsonApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::headers::InsightHeaders;
use api_core::{
    ApiError,
    State,
};
use api_wire_types::CreateListEntryRequest;
use crypto::aead::{
    AeadSealedBytes,
    SealingKey,
};
use db::models::insight_event::CreateInsightEvent;
use db::models::list::List;
use db::models::list_entry::ListEntry;
use db::models::tenant::Tenant;
use itertools::Itertools;
use newtypes::{
    ListEntryValue,
    ListId,
    PiiBytes,
    PiiString,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};
use std::collections::HashSet;

#[api_v2_operation(description = "Creates a new list entry", tags(Lists, Organization, Private))]
#[actix::post("/org/lists/{list_id}/entries")]
pub async fn create_list_entry(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    list_id: web::Path<ListId>,
    request: Json<CreateListEntryRequest>,
    insights: InsightHeaders,
) -> JsonApiListResponse<api_wire_types::ListEntry> {
    let auth = auth.check_guard(TenantGuard::WriteLists)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();
    let CreateListEntryRequest { entries } = request.into_inner();

    let tid = tenant_id.clone();
    let (tenant, list, existing_entries) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let t = Tenant::get(conn, &tid)?;
            let list = List::get(conn, &tid, is_live, &list_id)?;
            let entries = ListEntry::list(conn, &list_id)?;
            Ok((t, list, entries))
        })
        .await?;

    let decrypted_list_key = SealingKey::new(
        state
            .enclave_client
            .decrypt_to_pii_bytes(&list.e_data_key.into(), &tenant.e_private_key)
            .await?
            .into_leak(),
    )?;
    let decrypted_existing_entries = existing_entries
        .iter()
        .map(|e| {
            decrypted_list_key
                .unseal_bytes(AeadSealedBytes(e.e_data.clone().0))
                .map_err(ApiError::from)
                .map(PiiBytes::new)
                .and_then(|b| PiiString::try_from(b).map_err(ApiError::from))
        })
        .collect::<Result<HashSet<_>, _>>()?;

    let list_id = list.id.clone();
    let key = decrypted_list_key.clone();
    let insight = CreateInsightEvent::from(insights);
    let list_entries = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let canonicalized = entries
                .into_iter()
                .map(|d| -> ApiResult<_> {
                    let parsed = ListEntryValue::parse(list.kind, d)?;
                    Ok(parsed.canonicalize())
                })
                .collect::<Result<Vec<_>, _>>()?;

            // Remove duplicates and encrypt.
            let e_data = canonicalized
                .into_iter()
                .unique()
                .filter(|canon| !decrypted_existing_entries.contains(canon))
                .map(|canon| -> ApiResult<_> {
                    let enc = key.seal_bytes(canon.leak().as_bytes()).map(|b| b.into())?;
                    Ok(enc)
                })
                .collect::<Result<Vec<_>, _>>()?;

            let ie = insight.insert_with_conn(conn)?;
            Ok(ListEntry::bulk_create(
                conn,
                &list_id,
                actor.into(),
                e_data,
                &tenant_id,
                is_live,
                &ie.id,
            )?)
        })
        .await?;

    // actually decrypt using the key as a sanity check here
    let decrypted_list_entries: Vec<_> = list_entries
        .into_iter()
        .map(|le| {
            decrypted_list_key
                .unseal_bytes(AeadSealedBytes(le.e_data.clone().0))
                .map_err(ApiError::from)
                .and_then(|b| PiiBytes::new(b).try_into().map_err(ApiError::from))
                .map(|p| (le, p))
        })
        .collect::<Result<Vec<_>, _>>()?;

    Ok(decrypted_list_entries
        .into_iter()
        .map(api_wire_types::ListEntry::from_db)
        .collect())
}
