use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::list_entry_creation;
use diesel::{prelude::*, Insertable, Queryable};
use newtypes::{
    AuditEventDetail, AuditEventId, DataLifetimeSeqno, DbActor, InsightEventId, ListEntryCreationId, ListId,
    TenantId,
};

use super::audit_event::NewAuditEvent;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = list_entry_creation)]
/// Many-to-One table that tracks the bulk creation of ListEntry's.
/// When a 1 or more ListEntry's are added by some user in a single bulk add operation, we write 1 ListEntryCreation row and each ListEntry fk's to that
/// Added primarly for ease of integration with AuditEvent. But is generally a nice explicit way to papertrail list edit (and not have to treat created_seqno as a sort of identifier)
/// Also denormalizes a few fields from ListEntry in anticipation of that being useful
pub struct ListEntryCreation {
    pub id: ListEntryCreationId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub list_id: ListId,
    pub actor: DbActor,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = list_entry_creation)]
struct NewListEntryCreation<'a> {
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    list_id: &'a ListId,
    actor: &'a DbActor,
}

impl ListEntryCreation {
    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument("ListEntryCreation::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        created_seqno: DataLifetimeSeqno,
        created_at: DateTime<Utc>,
        list_id: &ListId,
        actor: &DbActor,
        tenant_id: &TenantId,
        is_live: bool,
        insight_event_id: &InsightEventId,
    ) -> DbResult<Self> {
        let new = NewListEntryCreation {
            created_at,
            created_seqno,
            list_id,
            actor,
        };

        let res = diesel::insert_into(list_entry_creation::table)
            .values(new)
            .get_result::<Self>(conn.conn())?;

        NewAuditEvent {
            id: AuditEventId::generate(),
            tenant_id: tenant_id.clone(),
            principal_actor: actor.clone(),
            insight_event_id: insight_event_id.clone(),
            detail: AuditEventDetail::CreateListEntry {
                is_live,
                list_id: list_id.clone(),
                list_entry_creation_id: res.id.clone(),
            },
        }
        .create(conn)?;

        Ok(res)
    }
}
