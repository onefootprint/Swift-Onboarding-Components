use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{utils::headers::InsightHeaders, ApiError};
use api_wire_types::CreateListEntryRequest;
use crypto::aead::{AeadSealedBytes, SealingKey};
use db::models::{insight_event::CreateInsightEvent, list::List, list_entry::ListEntry, tenant::Tenant};
use itertools::Itertools;
use newtypes::{ListEntryValue, ListId, PiiBytes};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(description = "Creates a new list entry", tags(Lists, Organization, Private))]
#[actix::post("/org/lists/{list_id}/entries")]
pub async fn create_list_entry(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    list_id: web::Path<ListId>,
    request: Json<CreateListEntryRequest>,
    insights: InsightHeaders,
) -> ApiResult<Json<ResponseData<Vec<api_wire_types::ListEntry>>>> {
    let auth = auth.check_guard(TenantGuard::WriteLists)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();
    let CreateListEntryRequest { entries } = request.into_inner();

    let tid = tenant_id.clone();
    let (tenant, list) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let t = Tenant::get(conn, &tid)?;
            let list = List::get(conn, &tid, is_live, &list_id)?;
            Ok((t, list))
        })
        .await?;

    let decrypted_list_key = SealingKey::new(
        state
            .enclave_client
            .decrypt_to_pii_bytes(&list.e_data_key.into(), &tenant.e_private_key)
            .await?
            .into_leak(),
    )?;

    let list_id = list.id.clone();
    let key = decrypted_list_key.clone();
    let insight = CreateInsightEvent::from(insights);
    let list_entries = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // TODO: check if `entries` already exists in some other ListEntry? bit weirder to check since its bytea but should still work i guess
            let e_data = entries
                .into_iter()
                .map(|d| -> ApiResult<_> {
                    let parsed = ListEntryValue::parse(list.kind, d)?;
                    let canon = parsed.canonicalize();
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

    ResponseData::ok(
        decrypted_list_entries
            .into_iter()
            .map(api_wire_types::ListEntry::from_db)
            .collect_vec(),
    )
    .json()
}
