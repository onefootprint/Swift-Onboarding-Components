use super::{data_lifetime::DataLifetime, ob_configuration::IsLive};
use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::list;
use diesel::{prelude::*, Insertable, Queryable};
use newtypes::{DataLifetimeSeqno, DbActor, ListAlias, ListId, ListKind, SealedVaultDataKey, TenantId};

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
        // TODO: uniqueness constraint on name/alias and will need to check + throw nice user error in API route for that
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
    pub fn get(conn: &mut PgConn, list_id: &ListId) -> DbResult<Self> {
        let res = list::table.filter(list::id.eq(list_id)).get_result(conn)?;
        Ok(res)
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

        let list = List::get(conn, &list.id).unwrap();
        assert_eq!(DbActor::Footprint, list.actor);
        assert_eq!("Some Real Baddies".to_owned(), list.name);
        assert_eq!(ListAlias::from_str("some_real_baddies").unwrap(), list.alias);
        assert_eq!(ListKind::EmailAddress, list.kind);
        assert_eq!(SealedVaultDataKey(vec![1, 2, 3, 2, 1]), list.e_data_key);
    }
}
