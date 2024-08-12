use crate::DbResult;
use crate::NonNullVec;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::access_event;
use diesel::Insertable;
use diesel::Queryable;
use diesel::RunQueryDsl;
use itertools::Itertools;
use newtypes::AccessEventId;
use newtypes::AccessEventKind;
use newtypes::DataIdentifier;
use newtypes::DbActor;
use newtypes::DecryptionContext;
use newtypes::InsightEventId;
use newtypes::ScopedVaultId;
use newtypes::TenantId;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = access_event)]
pub struct AccessEvent {
    pub id: AccessEventId,
    pub scoped_vault_id: ScopedVaultId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    /// The human-readable explanation for the access event
    pub reason: Option<String>,
    pub principal: DbActor,
    pub ordering_id: i64,
    pub kind: AccessEventKind,
    #[diesel(deserialize_as = NonNullVec<DataIdentifier>)]
    pub targets: Vec<DataIdentifier>,
    /// Denormalized from scoped_vault for faster querying
    pub tenant_id: TenantId,
    /// Denormalized from scoped_vault for faster querying
    pub is_live: bool,
    /// The machine-readable reason for the access event
    pub purpose: DecryptionContext,
}

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = access_event)]
pub struct NewAccessEventRow {
    pub id: AccessEventId,
    pub scoped_vault_id: ScopedVaultId,
    pub insight_event_id: InsightEventId,
    pub reason: Option<String>,
    pub principal: DbActor,
    pub kind: AccessEventKind,
    pub targets: Vec<DataIdentifier>,
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub purpose: DecryptionContext,
}

impl NewAccessEventRow {
    #[tracing::instrument("NewAccessEventRow::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<()> {
        AccessEvent::bulk_create(conn, vec![self])
    }
}

impl AccessEvent {
    #[tracing::instrument("AccessEvent::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut PgConn, rows: Vec<NewAccessEventRow>) -> DbResult<()> {
        let rows = rows.into_iter().filter(|r| !r.targets.is_empty()).collect_vec();
        diesel::insert_into(access_event::table)
            .values(rows)
            .execute(conn)?;

        Ok(())
    }
}
