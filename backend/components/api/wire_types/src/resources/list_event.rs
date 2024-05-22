use crate::*;
use newtypes::{AuditEventId, AuditEventName, ListEntryCreationId, ListEntryId, ListId, PiiString, TenantId};
use strum_macros::Display;

// TODO: this is basically a fork of AuditEvent but for use by the List specific /timeline endpoint which does retrieval/decryption of entries that we
// don't want the general /audit_events endpoint to do. But there's a better way to codeshare what's common here..
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct ListEvent {
    pub id: AuditEventId,
    pub timestamp: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub name: AuditEventName,
    pub principal: Actor,
    pub insight_event: Option<InsightEvent>,
    pub detail: ListEventDetail,
}

#[derive(Display, Debug, Clone, Serialize, Apiv2Schema)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum ListEventDetail {
    CreateListEntry {
        list_id: ListId,
        list_entry_creation_id: ListEntryCreationId,
        entries: Vec<PiiString>,
    },
    DeleteListEntry {
        list_id: ListId,
        list_entry_id: ListEntryId,
        entry: PiiString,
    },
}
