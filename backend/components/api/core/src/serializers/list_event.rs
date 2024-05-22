use crate::utils::db2api::DbToApi;
use api_wire_types::{Actor, InsightEvent, ListEvent, ListEventDetail};
use db::models::audit_event::JoinedAuditEvent;

impl DbToApi<(JoinedAuditEvent, ListEventDetail)> for ListEvent {
    fn from_db((event, detail): (JoinedAuditEvent, ListEventDetail)) -> Self {
        let JoinedAuditEvent {
            audit_event,
            tenant: _,
            saturated_actor,
            insight_event,
            scoped_vault: _,
            ob_configuration: _,
            document_data: _,
            tenant_api_key: _,
            tenant_user: _,
            tenant_role: _,
            list_entry_creation: _,
            list_entry: _,
            list: _,
        } = event;

        api_wire_types::ListEvent {
            id: audit_event.id,
            timestamp: audit_event.timestamp,
            tenant_id: audit_event.tenant_id,
            name: audit_event.name,
            principal: Actor::from_db(saturated_actor),
            insight_event: Some(InsightEvent::from_db(insight_event)),
            detail,
        }
    }
}
