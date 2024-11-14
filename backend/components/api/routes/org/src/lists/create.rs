use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::headers::InsightHeaders;
use api_core::FpResult;
use api_core::State;
use api_errors::BadRequestInto;
use api_wire_types::CreateListRequest;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::insight_event::CreateInsightEvent;
use db::models::list::List;
use db::models::list_entry::ListEntry;
use db::models::tenant::Tenant;
use itertools::Itertools;
use newtypes::DbActor;
use newtypes::ListEntryValue;
use newtypes::SealedVaultDataKey;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(description = "Creates a new List", tags(Lists, Organization, Private))]
#[actix::post("/org/lists")]
pub async fn create_list(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    request: Json<CreateListRequest>,
    insights: InsightHeaders,
) -> ApiResponse<api_wire_types::List> {
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
        .db_transaction(move |conn| -> FpResult<_> {
            let tenant = Tenant::get(conn, &tenant_id)?;
            if List::find(conn, &tenant_id, is_live, &name, &alias)?.is_some() {
                return BadRequestInto("List with that name already exists");
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
                    let canonicalized = entries
                        .into_iter()
                        .map(|d| -> FpResult<_> {
                            let parsed = ListEntryValue::parse(list.kind, d)?;
                            Ok(parsed.canonicalize())
                        })
                        .collect::<Result<Vec<_>, _>>()?;

                    // Remove duplicates and encrypt.
                    let e_data = canonicalized
                        .into_iter()
                        .unique()
                        .map(|canon| -> FpResult<_> {
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

    Ok(api_wire_types::List::from_db((list, entries_count, false)))
}
