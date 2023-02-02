use crate::PgConnection;
use crate::{
    schema::{data_lifetime, email},
    DbResult, HasLifetime, HasSealedIdentityData, TxnPgConnection,
};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::IdentityDataKind;
use newtypes::{DataLifetimeId, DataLifetimeSeqno};
use newtypes::{
    DataPriority, EmailId, Fingerprint as FingerprintData, ScopedUserId, SealedVaultBytes, UserVaultId,
};
use serde::{Deserialize, Serialize};

use super::user_vault::UserVault;
use super::{
    data_lifetime::DataLifetime,
    fingerprint::{Fingerprint, NewFingerprint},
};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = email)]
pub struct Email {
    pub id: EmailId,
    pub e_data: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub lifetime_id: DataLifetimeId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = email)]
pub struct NewEmail {
    pub e_data: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub lifetime_id: DataLifetimeId,
}

impl Email {
    pub fn list(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> DbResult<Vec<Self>> {
        let results = email::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::user_vault_id.eq(user_vault_id))
            .filter(data_lifetime::deactivated_seqno.is_null())
            .select(email::all_columns)
            .load(conn)?;
        Ok(results)
    }

    pub fn create(
        conn: &mut TxnPgConnection,
        uv_id: &UserVaultId,
        e_data: SealedVaultBytes,
        fingerprint: FingerprintData,
        priority: DataPriority,
        su_id: &ScopedUserId,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Email> {
        let lifetime = DataLifetime::create(conn, uv_id, Some(su_id), IdentityDataKind::Email.into(), seqno)?;
        let new_row = NewEmail {
            e_data,
            is_verified: false,
            priority,
            lifetime_id: lifetime.id.clone(),
        };
        let email = diesel::insert_into(email::table)
            .values(new_row)
            .get_result(conn.conn())?;

        // After inserting the data, also create a fingerprint for this piece of data tied to the
        // same DataLifetime
        let new_fingerprint = NewFingerprint {
            sh_data: fingerprint,
            kind: IdentityDataKind::Email.into(),
            lifetime_id: lifetime.id,
            is_unique: false,
        };
        // TODO: ensure that the fingerprint tuple of (user_vault_id, fingerprint) is unique
        Fingerprint::bulk_create(conn, vec![new_fingerprint])?;

        Ok(email)
    }

    pub fn get(
        conn: &mut PgConnection,
        id: &EmailId,
        user_vault_id: &UserVaultId,
    ) -> DbResult<(Email, UserVault)> {
        use crate::schema::user_vault;
        let result = email::table
            .inner_join(data_lifetime::table.inner_join(user_vault::table))
            .filter(email::id.eq(id))
            .filter(data_lifetime::user_vault_id.eq(user_vault_id))
            .select((email::all_columns, user_vault::all_columns))
            .get_result(conn)?;
        Ok(result)
    }

    pub fn mark_verified(conn: &mut PgConnection, id: &EmailId) -> DbResult<()> {
        diesel::update(email::table)
            .filter(email::id.eq(id))
            .set(email::is_verified.eq(true))
            .execute(conn)?;
        Ok(())
    }
}

impl HasLifetime for Email {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    /// Note: only returns primary emails
    fn get_for(conn: &mut PgConnection, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = email::table
            .filter(email::lifetime_id.eq_any(lifetime_ids))
            .filter(email::priority.eq(DataPriority::Primary))
            .get_results(conn)?;
        Ok(results)
    }
}

impl HasSealedIdentityData for Email {
    fn e_data(&self) -> &SealedVaultBytes {
        &self.e_data
    }
}
