use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_wire_types::CreateListEntryRequest;
use crypto::aead::{AeadSealedBytes, SealingKey};
use db::models::{list::List, list_entry::ListEntry, tenant::Tenant};
use newtypes::{ListId, PiiBytes};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(description = "Creates a new list entry", tags(Organization, Private, Lists))]
#[actix::post("/org/lists/{list_id}/entries")]
pub async fn create_list_entry(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    list_id: web::Path<ListId>,
    request: Json<CreateListEntryRequest>,
) -> ApiResult<Json<ResponseData<api_wire_types::ListEntry>>> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?; // TODO: new guard for this + /rules probably
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let CreateListEntryRequest { data } = request.into_inner();

    let (tenant, list) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let t = Tenant::get(conn, &tenant_id)?;
            let list = List::get(conn, &tenant_id, is_live, &list_id)?;
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
    let list_entry = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // TODO: validate `data` against `list.kind`
            // TODO: check if `data` already exists in some other ListEntry? bit weirder to check since its bytea but should still work i guess
            Ok(ListEntry::create(
                conn,
                &list_id,
                actor.into(),
                &key.seal_bytes(data.leak().as_bytes())?.into(),
            )?)
        })
        .await?;

    // actually decrypt using the key as a sanity check here
    let decrypted_data =
        PiiBytes::new(decrypted_list_key.unseal_bytes(AeadSealedBytes(list_entry.e_data.clone().0))?)
            .try_into()?;

    ResponseData::ok(api_wire_types::ListEntry::from_db((list_entry, decrypted_data))).json() // use of `data` here is kinda cheeky but avoids having to use enclave
}
