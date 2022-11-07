use db::access_event::{AccessEventListItemForTenant, AccessEventListItemForUser};

use crate::utils::db2api::DbToApi;

impl DbToApi<AccessEventListItemForUser> for api_wire_types::AccessEvent {
    fn from_db(evt: AccessEventListItemForUser) -> Self {
        let AccessEventListItemForUser {
            event,
            tenant_name,
            scoped_user,
        } = evt;

        api_wire_types::AccessEvent {
            fp_user_id: scoped_user.fp_user_id,
            tenant_id: scoped_user.tenant_id,
            reason: event.reason,
            principal: tenant_name, // we don't want to leak any principal, just the tenant name
            timestamp: event.timestamp,
            ordering_id: event.ordering_id,
            insight_event: None, // we don't want to expose tenant location to end user
            kind: event.kind,
            targets: event.targets,
        }
    }
}

impl DbToApi<AccessEventListItemForTenant> for api_wire_types::AccessEvent {
    fn from_db(evt: AccessEventListItemForTenant) -> Self {
        let AccessEventListItemForTenant {
            event,
            scoped_user,
            insight,
        } = evt;

        api_wire_types::AccessEvent {
            fp_user_id: scoped_user.fp_user_id,
            tenant_id: scoped_user.tenant_id,
            reason: event.reason,
            principal: event.principal,
            timestamp: event.timestamp,
            ordering_id: event.ordering_id,
            insight_event: insight.map(api_wire_types::InsightEvent::from_db),
            kind: event.kind,
            targets: event.targets,
        }
    }
}
