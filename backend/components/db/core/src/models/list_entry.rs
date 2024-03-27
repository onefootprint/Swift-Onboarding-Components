use std::collections::HashMap;

use super::data_lifetime::DataLifetime;
use crate::{DbError, DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::list_entry;
use diesel::{prelude::*, Insertable, Queryable};
use itertools::Itertools;
use newtypes::{DataLifetimeSeqno, DbActor, ListEntryId, ListId, Locked, SealedVaultBytes};

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
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = list_entry)]
struct NewListEntry<'a> {
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    list_id: &'a ListId,
    actor: DbActor,
    e_data: &'a SealedVaultBytes,
}

impl ListEntry {
    #[tracing::instrument("ListEntry::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        list_id: &ListId,
        actor: DbActor,
        e_data: &SealedVaultBytes,
    ) -> DbResult<Self> {
        let created_seqno = DataLifetime::get_current_seqno(conn)?;
        let new_list_entry = NewListEntry {
            created_at: Utc::now(),
            created_seqno,
            list_id,
            actor,
            e_data,
        };

        let res = diesel::insert_into(list_entry::table)
            .values(new_list_entry)
            .get_result::<Self>(conn)?;
        Ok(res)
    }

    #[tracing::instrument("ListEntry::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        list_id: &ListId,
        actor: DbActor,
        e_data: Vec<SealedVaultBytes>,
    ) -> DbResult<Vec<Self>> {
        let created_at = Utc::now();
        let created_seqno = DataLifetime::get_current_seqno(conn)?;
        let new_list_entries: Vec<_> = e_data
            .iter()
            .map(|e| NewListEntry {
                created_at,
                created_seqno,
                list_id,
                actor: actor.clone(),
                e_data: e,
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

    #[allow(clippy::self_named_constructors)]
    #[tracing::instrument("ListEntry::list", skip_all)]
    pub fn list(conn: &mut PgConn, list_id: &ListId) -> DbResult<Vec<Self>> {
        let res = list_entry::table
            .filter(list_entry::list_id.eq(list_id))
            .filter(list_entry::deactivated_seqno.is_null())
            .order_by(list_entry::created_at.desc())
            .get_results(conn)?;
        Ok(res)
    }

    #[allow(clippy::self_named_constructors)]
    #[tracing::instrument("ListEntry::list_bulk", skip_all)]
    pub fn list_bulk(conn: &mut PgConn, ids: Vec<&ListId>) -> DbResult<HashMap<ListId, Vec<Self>>> {
        let res = list_entry::table
            .filter(list_entry::list_id.eq_any(ids))
            .filter(list_entry::deactivated_seqno.is_null())
            .order_by(list_entry::created_at.desc())
            .get_results::<Self>(conn)?
            .into_iter()
            .into_group_map_by(|e| e.list_id.clone());
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

    #[tracing::instrument("List::deactivate", skip_all)]
    pub fn deactivate(conn: &mut TxnPgConn, list_entry: Locked<Self>) -> DbResult<Self> {
        if list_entry.deactivated_seqno.is_some() {
            return Err(DbError::ListEntryAlreadyDeactivated);
        }

        let now = Utc::now();
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let res = diesel::update(list_entry::table)
            .filter(list_entry::id.eq(&list_entry.id))
            .set((
                list_entry::deactivated_at.eq(now),
                list_entry::deactivated_seqno.eq(seqno),
            ))
            .get_result(conn.conn())?;
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::prelude::*;
    use macros::db_test;
    use newtypes::DbActor;

    #[db_test]
    fn test_create(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let list = tests::fixtures::list::create(conn, &t.id);

        let le1 = ListEntry::create(
            conn,
            &list.id,
            DbActor::Footprint,
            &SealedVaultBytes(vec![1, 2, 3]),
        )
        .unwrap();
        assert_eq!(DbActor::Footprint, le1.actor);
        assert_eq!(SealedVaultBytes(vec![1, 2, 3]), le1.e_data);
    }

    #[db_test]
    fn test_deactivate(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let list = tests::fixtures::list::create(conn, &t.id);

        let le = tests::fixtures::list_entry::create(conn, &list.id);
        assert_eq!(1, ListEntry::list(conn, &list.id).unwrap().len());

        let le = ListEntry::lock(conn, &le.id).unwrap();
        let le = ListEntry::deactivate(conn, le).unwrap();
        assert!(le.deactivated_at.is_some());
        assert!(le.deactivated_seqno.is_some());

        assert_eq!(0, ListEntry::list(conn, &list.id).unwrap().len());
        let le = ListEntry::lock(conn, &le.id).unwrap();
        assert!(matches!(
            ListEntry::deactivate(conn, le).unwrap_err(),
            DbError::ListEntryAlreadyDeactivated
        ));
    }
}
