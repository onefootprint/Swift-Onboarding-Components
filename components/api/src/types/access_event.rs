use chrono::{DateTime, Utc};
use db::access_event::{AccessEventListItemForTenant, AccessEventListItemForUser};
use newtypes::{DataKind, FootprintUserId, TenantId};
use paperclip::actix::Apiv2Schema;

use crate::types::insight_event::ApiInsightEvent;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiAccessEvent {
    pub fp_user_id: FootprintUserId,
    pub tenant_id: TenantId,
    pub data_kinds: Vec<DataKind>,
    pub reason: String,
    pub principal: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub ordering_id: i64,
    pub insight_event: Option<ApiInsightEvent>,
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
            data_kinds: event.data_kinds,
            reason: event.reason,
            principal: event.principal,
            timestamp: event.timestamp,
            ordering_id: event.ordering_id,
            insight_event: insight.map(ApiInsightEvent::from),
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
            data_kinds: event.data_kinds,
            reason: event.reason,
            principal: Some(tenant_name), // we don't want to leak any principal, just the tenant name
            timestamp: event.timestamp,
            ordering_id: event.ordering_id,
            insight_event: None, // we don't want to expose tenant location to end user
        }
    }
}
