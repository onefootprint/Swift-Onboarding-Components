use std::collections::HashMap;

use super::{
    audit_event::NewAuditEvent, data_lifetime::DataLifetime, list::List,
    list_entry_creation::ListEntryCreation,
};
use crate::{DbError, DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{list, list_entry};
use diesel::{prelude::*, Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    AuditEventDetail, AuditEventId, DataLifetimeSeqno, DbActor, InsightEventId, ListEntryCreationId,
    ListEntryId, ListId, Locked, PiiString, SealedVaultBytes, TenantId,
};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = list_entry)]
/// Represents a single entry/piece of data in a `List` (ie some email address or ip address, etc)
pub struct ListEntry {
    pub id: ListEntryId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,

    pub list_id: ListId,
    pub actor: DbActor,
    pub e_data: SealedVaultBytes,
    pub deactivated_by: Option<DbActor>,
    pub list_entry_creation_id: Option<ListEntryCreationId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = list_entry)]
struct NewListEntry<'a> {
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    list_id: &'a ListId,
    actor: DbActor,
    e_data: &'a SealedVaultBytes,
    list_entry_creation_id: &'a ListEntryCreationId,
}

pub type ListWithEntries = (List, Vec<ListEntry>);
pub type DecryptedEntry = (ListEntry, PiiString);
pub type ListWithDecryptedEntries = (List, Vec<DecryptedEntry>);

impl ListEntry {
    #[tracing::instrument("ListEntry::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        list_id: &ListId,
        actor: DbActor,
        e_data: &SealedVaultBytes,
        tenant_id: &TenantId,
        is_live: bool,
        insight_event_id: &InsightEventId,
    ) -> DbResult<Self> {
        Self::bulk_create(
            conn,
            list_id,
            actor,
            vec![e_data.clone()],
            tenant_id,
            is_live,
            insight_event_id,
        )?
        .pop()
        .ok_or(DbError::IncorrectNumberOfRowsUpdated)
    }

    #[tracing::instrument("ListEntry::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        list_id: &ListId,
        actor: DbActor,
        e_data: Vec<SealedVaultBytes>,
        tenant_id: &TenantId,
        is_live: bool,
        insight_event_id: &InsightEventId,
    ) -> DbResult<Vec<Self>> {
        let created_at = Utc::now();
        let created_seqno = DataLifetime::get_current_seqno(conn)?;

        let lec = ListEntryCreation::create(
            conn,
            created_seqno,
            created_at,
            list_id,
            &actor,
            tenant_id,
            is_live,
            insight_event_id,
        )?;

        let new_list_entries: Vec<_> = e_data
            .iter()
            .map(|e| NewListEntry {
                created_at,
                created_seqno,
                list_id,
                actor: actor.clone(),
                e_data: e,
                list_entry_creation_id: &lec.id,
            })
            .collect();

        let res = diesel::insert_into(list_entry::table)
            .values(new_list_entries)
            .get_results::<Self>(conn.conn())?;
        Ok(res)
    }

    #[tracing::instrument("ListEntry::get", skip_all)]
    pub fn get(conn: &mut PgConn, list_entry_id: &ListEntryId) -> DbResult<Self> {
        let res = list_entry::table
            .filter(list_entry::id.eq(list_entry_id))
            .get_result(conn)?;
        Ok(res)
    }

    #[tracing::instrument("ListEntry::get", skip_all)]
    pub fn bulk_get(
        conn: &mut PgConn,
        list_entry_ids: &[ListEntryId],
    ) -> DbResult<HashMap<ListEntryId, ListEntry>> {
        let res = list_entry::table
            .filter(list_entry::id.eq_any(list_entry_ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|e| (e.id.clone(), e))
            .collect();
        Ok(res)
    }

    #[allow(clippy::self_named_constructors)]
    #[tracing::instrument("ListEntry::list", skip_all)]
    pub fn list(conn: &mut PgConn, list_id: &ListId) -> DbResult<Vec<Self>> {
        let res = list_entry::table
            .filter(list_entry::list_id.eq(list_id))
            .filter(list_entry::deactivated_seqno.is_null())
            // TODO: limit/paginate here 
            .order_by(list_entry::created_at.desc())
            .get_results(conn)?;
        Ok(res)
    }

    #[allow(clippy::self_named_constructors)]
    #[tracing::instrument("ListEntry::list_bulk", skip_all)]
    pub fn list_bulk(conn: &mut PgConn, ids: &[ListId]) -> DbResult<HashMap<ListId, ListWithEntries>> {
        let mut entries = list_entry::table
            .filter(list_entry::list_id.eq_any(ids))
            .filter(list_entry::deactivated_seqno.is_null())
            .order_by(list_entry::created_at.desc())
            .get_results::<Self>(conn)?
            .into_iter()
            .into_group_map_by(|e| e.list_id.clone());

        let res = list::table
            .filter(list::id.eq_any(ids))
            .get_results::<List>(conn)?
            .into_iter()
            .map(|l| {
                let e = entries.remove(&l.id).unwrap_or(vec![]);
                (l.id.clone(), (l, e))
            })
            .collect();
        Ok(res)
    }

    /// Retrieves all ListEntry's for all input ListEntryCreationId's
    /// Note that this could potentially have a very large result set and we are not doing any limiting here. We are relying on the implicit assumptions that (1) any single ListEntryCreation has a reasonably bounded number of ListEntry's associated with it (ie because we have an API max payload size or we explicilty limit how many entries can be added at once) and (2) we would only call this with a reasonable number of ListEntryCreationId's (ie because we call this from a pagination list events endpoint and never retrieve more than a reasonable number of events at once)
    #[tracing::instrument("ListEntry::bulk_list_by_creation_id", skip_all)]
    pub fn bulk_list_by_creation_id(
        conn: &mut PgConn,
        lec_ids: &[ListEntryCreationId],
    ) -> DbResult<HashMap<ListEntryCreationId, Vec<Self>>> {
        let res = list_entry::table
            .filter(list_entry::list_entry_creation_id.eq_any(lec_ids))
            .order_by((list_entry::list_entry_creation_id, list_entry::id))
            .get_results::<ListEntry>(conn)?
            .into_iter()
            .filter_map(|le| {
                le.list_entry_creation_id
                    .clone()
                    .map(|lec_id| (lec_id.clone(), le))
            })
            .into_group_map();

        Ok(res)
    }

    #[tracing::instrument("ListEntry::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, list_entry_id: &ListEntryId) -> DbResult<Locked<Self>> {
        let result = list_entry::table
            .filter(list_entry::id.eq(list_entry_id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("ListEntry::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        list_entry: Locked<Self>,
        actor: &DbActor,
        tenant_id: &TenantId,
        is_live: bool,
        insight_event_id: &InsightEventId,
    ) -> DbResult<Self> {
        if list_entry.deactivated_seqno.is_some() {
            return Err(DbError::ListEntryAlreadyDeactivated);
        }

        let now = Utc::now();
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let res: ListEntry = diesel::update(list_entry::table)
            .filter(list_entry::id.eq(&list_entry.id))
            .set((
                list_entry::deactivated_at.eq(now),
                list_entry::deactivated_seqno.eq(seqno),
                list_entry::deactivated_by.eq(actor),
            ))
            .get_result(conn.conn())?;

        NewAuditEvent {
            id: AuditEventId::generate(),
            tenant_id: tenant_id.clone(),
            principal_actor: actor.clone(),
            insight_event_id: insight_event_id.clone(),
            detail: AuditEventDetail::DeleteListEntry {
                is_live,
                list_entry_id: res.id.clone(),
            },
        }
        .create(conn)?;

        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::prelude::*;
    use db_schema::schema::list_entry_creation;
    use macros::db_test;
    use newtypes::DbActor;

    #[db_test]
    fn test_create(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let list = tests::fixtures::list::create(conn, &t.id, true);

        let ie = tests::fixtures::insight_event::create(conn);
        let le1 = ListEntry::create(
            conn,
            &list.id,
            DbActor::Footprint,
            &SealedVaultBytes(vec![1, 2, 3]),
            &t.id,
            false,
            &ie.id,
        )
        .unwrap();
        assert_eq!(DbActor::Footprint, le1.actor);
        assert_eq!(SealedVaultBytes(vec![1, 2, 3]), le1.e_data);

        // list_entry_creation created
        let lec: ListEntryCreation = list_entry_creation::table
            .filter(list_entry_creation::id.eq(le1.list_entry_creation_id.unwrap()))
            .get_result(conn.conn())
            .unwrap();

        assert_eq!(le1.created_at, lec.created_at);
        assert_eq!(le1.created_seqno, lec.created_seqno);
        assert_eq!(le1.list_id, lec.list_id);
        assert_eq!(le1.actor, lec.actor);
    }

    #[db_test]
    fn test_deactivate(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let list = tests::fixtures::list::create(conn, &t.id, true);
        let ie = tests::fixtures::insight_event::create(conn);

        let le = tests::fixtures::list_entry::create(conn, &t.id, &list.id);
        assert_eq!(1, ListEntry::list(conn, &list.id).unwrap().len());

        let le = ListEntry::lock(conn, &le.id).unwrap();
        let le = ListEntry::deactivate(conn, le, &DbActor::Footprint, &t.id, list.is_live, &ie.id).unwrap();
        assert!(le.deactivated_at.is_some());
        assert!(le.deactivated_seqno.is_some());

        assert_eq!(0, ListEntry::list(conn, &list.id).unwrap().len());
        let le = ListEntry::lock(conn, &le.id).unwrap();
        assert!(matches!(
            ListEntry::deactivate(conn, le, &DbActor::Footprint, &t.id, list.is_live, &ie.id).unwrap_err(),
            DbError::ListEntryAlreadyDeactivated
        ));
    }
}
