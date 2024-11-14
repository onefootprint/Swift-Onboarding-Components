use crate::audit_events::AuditEventCursor;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::Base64Cursor;
use api_core::types::CursorPaginatedResponse;
use api_core::types::CursorPaginatedResponseInner;
use api_core::types::CursorPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::FpError;
use api_core::FpResult;
use api_core::State;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use api_wire_types::ListEvent;
use api_wire_types::ListEventDetail;
use crypto::aead::AeadSealedBytes;
use crypto::aead::SealingKey;
use db::models::audit_event::AuditEvent;
use db::models::audit_event::FilterQueryParams;
use db::models::audit_event::JoinedAuditEvent;
use db::models::list::List;
use db::models::list_entry::ListEntry;
use db::models::tenant::Tenant;
use itertools::Itertools;
use newtypes::AuditEventMetadata;
use newtypes::AuditEventName;
use newtypes::ListEntryCreationId;
use newtypes::ListEntryId;
use newtypes::ListId;
use newtypes::PiiBytes;
use newtypes::PiiString;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use std::collections::HashMap;

pub const LIST_AUDIT_EVENT_NAMES: [AuditEventName; 2] =
    [AuditEventName::CreateListEntry, AuditEventName::DeleteListEntry];

#[api_v2_operation(
    tags(Lists, Organization, Private),
    description = "Returns events for a List."
)]
#[get("/org/lists/{id}/timeline")]
async fn timeline(
    state: web::Data<State>,
    list_id: web::Path<ListId>,
    pagination: web::Query<CursorPaginationRequest<Base64Cursor<AuditEventCursor>>>,
    auth: TenantSessionAuth,
) -> CursorPaginatedResponse<ListEvent, Base64Cursor<AuditEventCursor>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let list_id = list_id.into_inner();

    let page_size = pagination.page_size(&state);
    let cursor = pagination.cursor.as_ref().map(|co| co.inner());
    let params = FilterQueryParams {
        cursor: cursor.map(|c| (c.timestamp, c.id.clone())),
        tenant_id: tenant_id.clone(),
        names: LIST_AUDIT_EVENT_NAMES.to_vec(),
        is_live: Some(is_live),
        list_id: Some(list_id.clone()),
        ..Default::default()
    };

    let (events, list, list_entry_creations, list_entries) = state
        .db_transaction(move |conn| {
            let list = List::get(conn, &tenant_id, is_live, &list_id)?;
            let (events, _) = AuditEvent::filter(conn, params, (page_size + 1) as i64)?;

            let lec_ids = events
                .iter()
                .flat_map(|r| r.list_entry_creation.as_ref().map(|l| l.id.clone()))
                .collect_vec();
            let list_entry_creations = ListEntry::bulk_list_by_creation_id(conn, &lec_ids)?;

            let le_ids = events
                .iter()
                .flat_map(|r| r.list_entry.as_ref().map(|l| l.id.clone()))
                .collect_vec();
            let list_entries = ListEntry::bulk_get(conn, &le_ids)?;

            Ok((events, list, list_entry_creations, list_entries))
        })
        .await?;

    let next_cursor = pagination.cursor_item(&state, &events).map(|j| {
        Base64Cursor::new(AuditEventCursor {
            timestamp: j.audit_event.timestamp,
            id: j.audit_event.id.clone(),
        })
    });

    let saturated_events = saturate_events(
        &state,
        events,
        auth.tenant(),
        &list,
        list_entry_creations,
        list_entries,
    )
    .await?;

    let results = saturated_events
        .into_iter()
        .map(api_wire_types::ListEvent::from_db)
        .collect();
    CursorPaginatedResponseInner::ok(results, page_size, next_cursor, None)
}

async fn saturate_events(
    state: &State,
    events: Vec<JoinedAuditEvent>,
    tenant: &Tenant,
    list: &List,
    list_entry_creations: HashMap<ListEntryCreationId, Vec<ListEntry>>,
    list_entries: HashMap<ListEntryId, ListEntry>,
) -> FpResult<Vec<(JoinedAuditEvent, ListEventDetail)>> {
    let decrypted_list_key = SealingKey::new(
        state
            .enclave_client
            .decrypt_to_pii_bytes(&list.e_data_key.clone().into(), &tenant.e_private_key)
            .await?
            .into_leak(),
    )?;

    let decrypted_list_entry_creations = list_entry_creations
        .into_iter()
        .map(|(lec_id, les)| {
            les.into_iter()
                .map(|le| decrypt_list_entry(&decrypted_list_key, &le))
                .collect::<Result<Vec<_>, _>>()
                .map(|v| (lec_id, v))
        })
        .collect::<Result<HashMap<ListEntryCreationId, Vec<PiiString>>, _>>()?;

    let decrypted_list_entries = list_entries
        .into_iter()
        .map(|(le_id, le)| decrypt_list_entry(&decrypted_list_key, &le).map(|p| (le_id, p)))
        .collect::<Result<HashMap<ListEntryId, PiiString>, _>>()?;

    events
        .into_iter()
        .map(|le| {
            let detail = match le.audit_event.metadata {
                AuditEventMetadata::CreateListEntry => {
                    let entries = le
                        .list_entry_creation
                        .as_ref()
                        .and_then(|lec| decrypted_list_entry_creations.get(&lec.id))
                        .cloned()
                        .ok_or(ServerErr("list entries not found for CreateListEntry event"))?;
                    Ok(ListEventDetail::CreateListEntry {
                        list_id: le
                            .list
                            .clone()
                            .ok_or(ServerErr("list is not available for this event"))?
                            .id,
                        list_entry_creation_id: le
                            .list_entry_creation
                            .clone()
                            .ok_or(ServerErr("list_entry_creation is not available for this event"))?
                            .id,
                        entries,
                    })
                }
                AuditEventMetadata::DeleteListEntry => {
                    let entry = le
                        .list_entry
                        .as_ref()
                        .and_then(|le| decrypted_list_entries.get(&le.id))
                        .cloned()
                        .ok_or(ServerErr("list entries not available for this event"))?;
                    Ok(ListEventDetail::DeleteListEntry {
                        list_id: le
                            .list
                            .clone()
                            .ok_or(ServerErr("list is not available for this event"))?
                            .id,
                        list_entry_id: le
                            .list_entry
                            .clone()
                            .ok_or(ServerErr("entry not found for DeleteListEntry event"))?
                            .id,
                        entry,
                    })
                }
                _ => ServerErrInto("event is not a List event"),
            };
            detail.map(|d| (le, d))
        })
        .collect::<FpResult<Vec<_>>>()
}

fn decrypt_list_entry(key: &SealingKey, le: &ListEntry) -> FpResult<PiiString> {
    key.unseal_bytes(AeadSealedBytes(le.e_data.clone().0))
        .map_err(FpError::from)
        .map(PiiBytes::new)
        .and_then(|b| PiiString::try_from(b).map_err(FpError::from))
}
