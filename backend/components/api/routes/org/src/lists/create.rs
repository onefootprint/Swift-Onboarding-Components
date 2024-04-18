use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{errors::ValidationError, utils::headers::InsightHeaders};
use api_wire_types::CreateListRequest;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::{insight_event::CreateInsightEvent, list::List, list_entry::ListEntry, tenant::Tenant};
use newtypes::{DbActor, ListEntryValue, SealedVaultDataKey};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(description = "Creates a new List", tags(Lists, Organization, Private))]
#[actix::post("/org/lists")]
pub async fn create_list(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    request: Json<CreateListRequest>,
    insights: InsightHeaders,
) -> ApiResult<Json<ResponseData<api_wire_types::List>>> {
    let auth = auth.check_guard(TenantGuard::WriteLists)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let CreateListRequest {
        name,
        alias,
        kind,
        entries,
    } = request.into_inner();

    let db_actor: DbActor = actor.clone().into();
    let insight = CreateInsightEvent::from(insights);
    let (list, entries_count) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = Tenant::get(conn, &tenant_id)?;
            if List::find(conn, &tenant_id, is_live, &name, &alias)?.is_some() {
                return Err(ValidationError("List with that name already exists").into());
                // AssertionError? something else?
            }

            let (e_data_key, sealing_key) =
                SealedChaCha20Poly1305DataKey::generate_sealed_random_chacha20_poly1305_key_with_plaintext(
                    tenant.public_key.as_ref(),
                )?;
            let sealed_key = SealedVaultDataKey::try_from(e_data_key.sealed_key)?;
            let list = List::create(conn, &tenant_id, is_live, db_actor, name, alias, kind, sealed_key)?;

            let ie = insight.insert_with_conn(conn)?;
            let entries_count = match entries {
                Some(entries) => {
                    let e_data = entries
                        .into_iter()
                        .map(|d| -> ApiResult<_> {
                            let parsed = ListEntryValue::parse(list.kind, d)?;
                            let canon = parsed.canonicalize();
                            let enc = sealing_key
                                .seal_bytes(canon.leak().as_bytes())
                                .map(|b| b.into())?;
                            Ok(enc)
                        })
                        .collect::<Result<Vec<_>, _>>()?;

                    let entries_created = ListEntry::bulk_create(
                        conn,
                        &list.id,
                        actor.into(),
                        e_data,
                        &tenant.id,
                        is_live,
                        &ie.id,
                    )?;
                    entries_created.len()
                }
                None => 0,
            };

            Ok((list, entries_count))
        })
        .await?;

    ResponseData::ok(api_wire_types::List::from_db((list, entries_count, false))).json()
}
