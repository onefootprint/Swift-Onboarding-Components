use super::scoped_vault::ScopedVault;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::billing_event;
use diesel::dsl::count_star;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::BillingEventId;
use newtypes::BillingEventKind;
use newtypes::BillingStrategy;
use newtypes::ObConfigurationId;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use std::collections::HashMap;

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
    pub ob_configuration_id: Option<ObConfigurationId>,
    /// When set, the event that already existed during this billing period and prevented this one
    /// from being created
    pub existing_event_id: Option<BillingEventId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = billing_event)]
struct NewBillingEventRow<'a> {
    pub timestamp: DateTime<Utc>,
    pub kind: BillingEventKind,
    pub scoped_vault_id: &'a ScopedVaultId,
    pub ob_configuration_id: Option<&'a ObConfigurationId>,
    pub existing_event_id: Option<BillingEventId>,
}

impl BillingEvent {
    #[tracing::instrument("BillingEvent::get_counts", skip_all)]
    pub fn get_counts(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> FpResult<HashMap<BillingEventKind, i64>> {
        use db_schema::schema::scoped_vault;
        let counts = billing_event::table
            .inner_join(scoped_vault::table)
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(true))
            // Filter for events that occurred this month
            .filter(billing_event::timestamp.ge(start_date))
            .filter(billing_event::timestamp.lt(end_date))
            // Don't count events that had a duplicate already existing within the billing interval
            .filter(billing_event::existing_event_id.is_null())
            .group_by(billing_event::kind)
            .select((billing_event::kind, count_star()))
            .get_results::<(BillingEventKind, i64)>(conn)?.into_iter().collect();
        Ok(counts)
    }

    #[tracing::instrument("BillingEvent::create", skip_all)]
    /// Create a billing event with the given kind for the given SV.
    /// If an event has already been created for this product within the product's billing interval,
    /// save it with an existing_event_id.
    pub fn create(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        obc_id: Option<&ObConfigurationId>,
        kind: BillingEventKind,
    ) -> FpResult<Self> {
        ScopedVault::lock(conn, sv_id)?;
        let existing_query = billing_event::table
            .filter(billing_event::scoped_vault_id.eq(&sv_id))
            .filter(billing_event::kind.eq(kind))
            .into_boxed();
        let existing = match kind.billing_strategy() {
            BillingStrategy::Each => None,
            // Some billing events are only to be created once per user or once per user per interval
            BillingStrategy::PerUser => existing_query.get_result::<Self>(conn.conn()).optional()?,
            BillingStrategy::PerInterval(i) => existing_query
                .filter(billing_event::timestamp.gt(Utc::now() - i))
                .get_result::<Self>(conn.conn())
                .optional()?,
        };

        let event = NewBillingEventRow {
            timestamp: Utc::now(),
            scoped_vault_id: sv_id,
            ob_configuration_id: obc_id,
            kind,
            existing_event_id: existing.map(|e| e.id),
        };
        let event = diesel::insert_into(billing_event::table)
            .values(event)
            .get_result(conn.conn())?;
        Ok(event)
    }
}
