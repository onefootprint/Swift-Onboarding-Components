use std::collections::HashMap;

use super::{data_lifetime::DataLifetime, ob_configuration::IsLive};
use crate::{DbError, DbResult, NextPage, OffsetPagination, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::list::{self, BoxedQuery};
use diesel::{pg::Pg, prelude::*, Insertable, Queryable};
use newtypes::{
    DataLifetimeSeqno, DbActor, ListAlias, ListId, ListKind, Locked, SealedVaultDataKey, TenantId,
};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = list)]
/// Represents a list of data (emails, email domains, ip addresses, etc) that a Tenant can reference in Rules
/// aka "BlockList"'s but these lists don't inherently imply blocking/failing a user. They could be used in whatever manner in Rules
pub struct List {
    pub id: ListId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,

    pub tenant_id: TenantId,
    pub is_live: IsLive,
    pub actor: DbActor,
    pub name: String,
    pub alias: ListAlias,
    pub kind: ListKind,
    pub e_data_key: SealedVaultDataKey,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = list)]
struct NewList<'a> {
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    tenant_id: &'a TenantId,
    is_live: IsLive,
    actor: DbActor,
    name: String,
    alias: ListAlias,
    kind: ListKind,
    e_data_key: SealedVaultDataKey,
}

#[derive(AsChangeset)]
#[diesel(table_name = list)]
struct ListUpdate {
    name: String,
    alias: ListAlias,
}

impl List {
    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument("List::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        is_live: IsLive,
        actor: DbActor,
        name: String,
        alias: ListAlias, // TODO: still a bit unclear if this is user set or only automatically generated from us
        kind: ListKind,
        e_data_key: SealedVaultDataKey,
    ) -> DbResult<Self> {
        let created_seqno = DataLifetime::get_current_seqno(conn)?;
        let new_list = NewList {
            created_at: Utc::now(),
            created_seqno,
            tenant_id,
            is_live,
            actor,
            name,
            alias,
            kind,
            e_data_key,
        };

        let res = diesel::insert_into(list::table)
            .values(new_list)
            .get_result::<Self>(conn)?;
        Ok(res)
    }

    #[tracing::instrument("List::get", skip_all)]
    pub fn get(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool, list_id: &ListId) -> DbResult<Self> {
        let res = list::table
            .filter(list::tenant_id.eq(tenant_id))
            .filter(list::is_live.eq(is_live))
            .filter(list::id.eq(list_id))
            .get_result(conn)?;
        Ok(res)
    }

    #[tracing::instrument("List::bulk_get", skip_all)]
    pub fn bulk_get(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        is_live: bool,
        list_ids: &[ListId],
    ) -> DbResult<HashMap<ListId, Self>> {
        let res = list::table
            .filter(list::tenant_id.eq(tenant_id))
            .filter(list::is_live.eq(is_live))
            .filter(list::id.eq_any(list_ids))
            .get_results(conn)?;
        Ok(res
            .into_iter()
            .map(|list: Self| (list.id.clone(), list))
            .collect())
    }

    /// Find for tenant by case insensitively querying on name or alias
    #[tracing::instrument("List::find", skip_all)]
    pub fn find(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        is_live: IsLive,
        name: &String,
        alias: &ListAlias,
    ) -> DbResult<Option<Self>> {
        let res = list::table
            .filter(list::tenant_id.eq(tenant_id))
            .filter(list::is_live.eq(is_live))
            .filter(list::deactivated_seqno.is_null())
            .filter(list::name.ilike(name).or(list::alias.ilike(alias)))
            .get_result(conn)
            .optional()?;
        Ok(res)
    }

    fn list_query(tenant_id: &TenantId, is_live: bool) -> BoxedQuery<Pg> {
        let query = list::table
            .filter(list::tenant_id.eq(tenant_id))
            .filter(list::is_live.eq(is_live))
            .filter(list::deactivated_seqno.is_null())
            .into_boxed();
        query
    }

    #[allow(clippy::self_named_constructors)]
    #[tracing::instrument("List::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        is_live: bool,
        pagination: OffsetPagination,
    ) -> DbResult<(Vec<Self>, NextPage)> {
        let mut query = Self::list_query(tenant_id, is_live)
            .order_by(list::created_at.desc())
            .limit(pagination.limit());
        if let Some(offset) = pagination.offset() {
            query = query.offset(offset)
        }
        let res = query.get_results(conn)?;
        Ok(pagination.results(res))
    }

    #[tracing::instrument("List::count", skip_all)]
    pub fn count(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> DbResult<i64> {
        let count = Self::list_query(tenant_id, is_live).count().get_result(conn)?;
        Ok(count)
    }

    #[tracing::instrument("List::lock", skip_all)]
    pub fn lock(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        is_live: bool,
        list_id: &ListId,
    ) -> DbResult<Locked<Self>> {
        let result = list::table
            .filter(list::tenant_id.eq(tenant_id))
            .filter(list::is_live.eq(is_live))
            .filter(list::id.eq(list_id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("List::update", skip_all)]
    pub fn update(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        is_live: bool,
        id: &ListId,
        name: String,
        alias: ListAlias,
    ) -> DbResult<Self> {
        let update = ListUpdate { name, alias };
        let result = diesel::update(list::table)
            .filter(list::tenant_id.eq(tenant_id))
            .filter(list::is_live.eq(is_live))
            .filter(list::id.eq(&id))
            .filter(list::deactivated_seqno.is_null())
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("List::deactivate", skip_all)]
    pub fn deactivate(conn: &mut TxnPgConn, list: Locked<Self>) -> DbResult<Self> {
        if list.deactivated_seqno.is_some() {
            return Err(DbError::ListAlreadyDeactivated);
        }

        let now = Utc::now();
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let res = diesel::update(list::table)
            .filter(list::id.eq(&list.id))
            .filter(list::deactivated_seqno.is_null())
            .set((list::deactivated_at.eq(now), list::deactivated_seqno.eq(seqno)))
            .get_result(conn.conn())?;
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;
    use crate::tests::prelude::*;
    use macros::db_test;

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
            SealedVaultDataKey(vec![1, 2, 3, 2, 1]),
        )
        .unwrap();

        let list = List::get(conn, &t.id, true, &list.id).unwrap();
        assert_eq!(DbActor::Footprint, list.actor);
        assert_eq!("Some Real Baddies".to_owned(), list.name);
        assert_eq!(ListAlias::from_str("some_real_baddies").unwrap(), list.alias);
        assert_eq!(ListKind::EmailAddress, list.kind);
        assert_eq!(SealedVaultDataKey(vec![1, 2, 3, 2, 1]), list.e_data_key);
    }

    #[db_test]
    fn test_deactivate(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let list = tests::fixtures::list::create(conn, &t.id, true);
        let pagination = OffsetPagination::new(None, 10);
        assert_eq!(1, List::list(conn, &t.id, true, pagination).unwrap().0.len());

        let list = List::lock(conn, &t.id, true, &list.id).unwrap();
        let list = List::deactivate(conn, list).unwrap();
        assert!(list.deactivated_at.is_some());
        assert!(list.deactivated_seqno.is_some());

        let pagination = OffsetPagination::new(None, 10);
        assert_eq!(0, List::list(conn, &t.id, true, pagination).unwrap().0.len());
        let list = List::lock(conn, &t.id, true, &list.id).unwrap();
        assert!(matches!(
            List::deactivate(conn, list).unwrap_err(),
            DbError::ListAlreadyDeactivated
        ));
    }
}
