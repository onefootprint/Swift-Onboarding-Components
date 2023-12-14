use std::collections::HashMap;

use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::billing_event;
use diesel::dsl::count_star;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::{BillingEventId, BillingEventKind, ObConfigurationId, ScopedVaultId, TenantId};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = billing_event)]
/// This table was added in a pinch to bill for products that we only charge for annually.
/// Composing the invoice for these BillingEvents is really easy - you just query for the events
/// that happened this month.
/// Eventually, we may migrate this table to also represent discrete events (not just subscriptions)
/// where we insert a BillingEvent as soon as there is any billable occurence, like KYC or watchlist
/// checks.
pub struct BillingEvent {
    pub id: BillingEventId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub timestamp: DateTime<Utc>,
    pub kind: BillingEventKind,
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    /// When set, the event that already existed during this billing period and prevented this one
    /// from being created
    pub existing_event_id: Option<BillingEventId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = billing_event)]
#[allow(unused)]
struct NewBillingEventRow {
    pub timestamp: DateTime<Utc>,
    pub kind: BillingEventKind,
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
}

impl BillingEvent {
    #[tracing::instrument("BillingEvent::get_counts", skip_all)]
    pub fn get_counts(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> DbResult<HashMap<BillingEventKind, i64>> {
        use db_schema::schema::scoped_vault;
        let counts = billing_event::table
            .inner_join(scoped_vault::table)
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(true))
            // Filter for events that occurred this month
            .filter(billing_event::timestamp.ge(start_date))
            .filter(billing_event::timestamp.lt(end_date))
            .filter(billing_event::existing_event_id.is_null())
            .group_by(billing_event::kind)
            .select((billing_event::kind, count_star()))
            .get_results::<(BillingEventKind, i64)>(conn)?.into_iter().collect();
        Ok(counts)
    }
}
