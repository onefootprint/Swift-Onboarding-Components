use super::data_lifetime::DataLifetime;
use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::list_entry;
use diesel::{prelude::*, Insertable, Queryable};
use newtypes::{DataLifetimeSeqno, DbActor, ListEntryId, ListId, SealedVaultBytes};

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
    e_data: SealedVaultBytes,
}

impl ListEntry {
    #[tracing::instrument("ListEntry::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        list_id: &ListId,
        actor: DbActor,
        e_data: SealedVaultBytes,
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

    #[tracing::instrument("ListEntry::get", skip_all)]
    pub fn get(conn: &mut PgConn, list_entry_id: &ListEntryId) -> DbResult<Self> {
        let res = list_entry::table
            .filter(list_entry::id.eq(list_entry_id))
            .get_result(conn)?;
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{models::list::List, tests::prelude::*};
    use macros::db_test;
    use newtypes::{DbActor, ListAlias, ListKind, SealedVaultDataKey};
    use std::str::FromStr;

    #[db_test]
    fn test_create(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let list = List::create(
            conn,
            &t.id,
            true,
            DbActor::Footprint,
            "Some Real Baddies".to_owned(),
            ListAlias::from_str("some_real_baddies").unwrap(),
            ListKind::EmailAddress,
            SealedVaultDataKey(vec![1]),
        )
        .unwrap();

        let le1 = ListEntry::create(
            conn,
            &list.id,
            DbActor::Footprint,
            SealedVaultBytes(vec![1, 2, 3]),
        )
        .unwrap();
        assert_eq!(DbActor::Footprint, le1.actor);
        assert_eq!(SealedVaultBytes(vec![1, 2, 3]), le1.e_data);
    }
}
