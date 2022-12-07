use crate::schema::user_vault_data;
use crate::DbResult;
use crate::HasLifetime;
use crate::TxnPgConnection;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::DataLifetimeSeqno;
use newtypes::ScopedUserId;
use newtypes::SealedVaultBytes;
use newtypes::UserVaultId;
use newtypes::UvdKind;
use newtypes::{DataLifetimeId, UvdId};
use serde::{Deserialize, Serialize};

use super::data_lifetime::DataLifetime;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = user_vault_data)]
pub struct UserVaultData {
    pub id: UvdId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub lifetime_id: DataLifetimeId,
    pub kind: UvdKind,
    pub e_data: SealedVaultBytes,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_vault_data)]
pub struct NewUserVaultData {
    pub kind: UvdKind,
    pub e_data: SealedVaultBytes,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_vault_data)]
pub struct NewUserVaultDataRow {
    pub lifetime_id: DataLifetimeId,
    pub kind: UvdKind,
    pub e_data: SealedVaultBytes,
}

impl UserVaultData {
    pub fn bulk_create(
        conn: &mut TxnPgConnection,
        user_vault_id: UserVaultId,
        scoped_user_id: Option<ScopedUserId>,
        data: Vec<NewUserVaultData>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        // Make a DataLifetime row for each of the new pieces of data being inserted
        let lifetimes = DataLifetime::bulk_create(conn, user_vault_id, scoped_user_id, data.len(), seqno)?;
        let new_rows: Vec<_> = data
            .into_iter()
            .zip(lifetimes.into_iter())
            .map(|(new_uvd, lifetime)| NewUserVaultDataRow {
                lifetime_id: lifetime.id,
                kind: new_uvd.kind,
                e_data: new_uvd.e_data,
            })
            .collect();
        let results = diesel::insert_into(user_vault_data::table)
            .values(new_rows)
            .get_results(conn.conn())?;
        Ok(results)
    }

    /// Deactivates the uncommitted DataLifetimes associated with UserVaultData rows belonging to
    /// this (user, tenant) with the provided kinds.
    /// This should only be used when replacing speculative, un-committed user data with new un-committed user data
    pub fn bulk_deactivate_uncommitted(
        conn: &mut PgConnection,
        scoped_user_id: ScopedUserId,
        kinds: Vec<UvdKind>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<()> {
        // TODO we might want to eventually move this onto the HasLifetime trait - fine for now
        // since we don't have codepaths that do this for PhoneNumber or Email
        use crate::schema::data_lifetime;
        let lifetime_ids = user_vault_data::table
            .inner_join(data_lifetime::table)
            .filter(user_vault_data::kind.eq_any(kinds))
            .filter(data_lifetime::scoped_user_id.eq(scoped_user_id))
            .filter(data_lifetime::deactivated_seqno.is_null())
            // Specifically don't allow deactivating committed data here since we are replacing it
            // with uncommitted data
            .filter(data_lifetime::committed_seqno.is_null())
            .select(user_vault_data::lifetime_id).get_results(conn)?;
        DataLifetime::bulk_deactivate(conn, lifetime_ids, seqno)?;
        Ok(())
    }
}

impl HasLifetime for UserVaultData {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    fn e_data(&self) -> &SealedVaultBytes {
        &self.e_data
    }

    fn get_for(conn: &mut PgConnection, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = user_vault_data::table
            .filter(user_vault_data::lifetime_id.eq_any(lifetime_ids))
            .get_results(conn)?;
        Ok(results)
    }
}
