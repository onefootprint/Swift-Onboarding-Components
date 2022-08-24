use chrono::{DateTime, Utc};
use db::access_event::{AccessEventListItemForTenant, AccessEventListItemForUser};
use newtypes::{AccessEventKind, DataIdentifier, FootprintUserId, TenantId};
use paperclip::actix::Apiv2Schema;

use crate::types::insight_event::ApiInsightEvent;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiAccessEvent {
    pub fp_user_id: FootprintUserId,
    pub tenant_id: TenantId,
    pub reason: Option<String>,
    pub principal: String,
    pub timestamp: DateTime<Utc>,
    pub ordering_id: i64,
    pub insight_event: Option<ApiInsightEvent>,
    pub kind: AccessEventKind,
    pub targets: Vec<DataIdentifier>,
}

impl From<AccessEventListItemForTenant> for ApiAccessEvent {
    fn from(evt: AccessEventListItemForTenant) -> Self {
        let AccessEventListItemForTenant {
            event,
            scoped_user,
            insight,
        } = evt;

        ApiAccessEvent {
            fp_user_id: scoped_user.fp_user_id,
            tenant_id: scoped_user.tenant_id,
            reason: event.reason,
            principal: event.principal,
            timestamp: event.timestamp,
            ordering_id: event.ordering_id,
            insight_event: insight.map(ApiInsightEvent::from),
            kind: event.kind,
            targets: event.targets,
        }
    }
}

impl From<AccessEventListItemForUser> for ApiAccessEvent {
    fn from(evt: AccessEventListItemForUser) -> Self {
        let AccessEventListItemForUser {
            event,
            tenant_name,
            scoped_user,
        } = evt;

        ApiAccessEvent {
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
