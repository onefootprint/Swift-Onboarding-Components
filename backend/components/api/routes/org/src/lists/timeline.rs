use std::collections::HashMap;

use crate::{
    audit_events::AuditEventCursor,
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    State,
};
use api_core::{
    errors::AssertionError,
    types::{Base64Cursor, CursorPaginatedResponse, CursorPaginatedResponseInner, CursorPaginationRequest},
    utils::db2api::DbToApi,
    ApiError,
};
use api_wire_types::{ListEvent, ListEventDetail};
use crypto::aead::{AeadSealedBytes, SealingKey};
use db::models::{
    audit_event::{AuditEvent, FilterQueryParams, JoinedAuditEvent},
    list::List,
    list_entry::ListEntry,
    tenant::Tenant,
};
use itertools::Itertools;
use newtypes::{
    AuditEventMetadata, AuditEventName, ListEntryCreationId, ListEntryId, ListId, PiiBytes, PiiString,
};
use paperclip::actix::{api_v2_operation, get, web};

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
) -> CursorPaginatedResponse<Vec<ListEvent>, Base64Cursor<AuditEventCursor>> {
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
        is_live,
        list_id: Some(list_id.clone()),
        ..Default::default()
    };

    let (events, list, list_entry_creations, list_entries) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let list = List::get(conn, &tenant_id, is_live, &list_id)?;
            let events = AuditEvent::filter(conn, params, (page_size + 1) as i64)?;
            let events = events.into_iter().take(page_size).collect_vec(); // TODO: why is this needed?

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

    CursorPaginatedResponseInner::ok(
        saturated_events
            .into_iter()
            .map(api_wire_types::ListEvent::from_db)
            .collect(),
        next_cursor,
        None,
    )
}

async fn saturate_events(
    state: &State,
    events: Vec<JoinedAuditEvent>,
    tenant: &Tenant,
    list: &List,
    list_entry_creations: HashMap<ListEntryCreationId, Vec<ListEntry>>,
    list_entries: HashMap<ListEntryId, ListEntry>,
) -> ApiResult<Vec<(JoinedAuditEvent, ListEventDetail)>> {
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
                        .ok_or(AssertionError("list entries not found for CreateListEntry event"))?;
                    Ok(ListEventDetail::CreateListEntry {
                        list_entry_creation_id: le
                            .list_entry_creation
                            .clone()
                            .ok_or(AssertionError(
                                "list_entry_creation is not available for this event",
                            ))?
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
                        .ok_or(AssertionError("list entries not available for this event"))?;
                    Ok(ListEventDetail::DeleteListEntry {
                        list_entry_id: le
                            .list_entry
                            .clone()
                            .ok_or(AssertionError("entry not found for DeleteListEntry event"))?
                            .id,
                        entry,
                    })
                }
                _ => Err(AssertionError("event is not a List event").into()),
            };
            detail.map(|d| (le, d))
        })
        .collect::<ApiResult<Vec<_>>>()
}

fn decrypt_list_entry(key: &SealingKey, le: &ListEntry) -> ApiResult<PiiString> {
    key.unseal_bytes(AeadSealedBytes(le.e_data.clone().0))
        .map_err(ApiError::from)
        .map(PiiBytes::new)
        .and_then(|b| PiiString::try_from(b).map_err(ApiError::from))
}
