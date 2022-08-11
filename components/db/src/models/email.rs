use crate::{schema::email, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::{
    DataPriority, EmailId, Fingerprint as FingerprintData, FingerprintId, SealedVaultBytes, UserVaultId,
};
use serde::{Deserialize, Serialize};

use super::fingerprint::Fingerprint;
use super::user_vaults::UserVault;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = email)]
pub struct Email {
    pub id: EmailId,
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_data: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = email)]
pub struct NewEmail {
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_data: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
}

impl Email {
    pub fn list(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Vec<Self>, DbError> {
        let results = email::table
            .filter(email::user_vault_id.eq(user_vault_id))
            .filter(email::deactivated_at.is_null())
            .load(conn)?;
        Ok(results)
    }

    pub fn create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        e_data: SealedVaultBytes,
        fingerprints: Vec<FingerprintData>,
        is_verified: bool,
        priority: DataPriority,
    ) -> Result<Email, DbError> {
        let fingerprint_ids = Fingerprint::bulk_create(conn, fingerprints, &user_vault_id)?;
        let new_row = NewEmail {
            user_vault_id,
            fingerprint_ids,
            e_data,
            is_verified,
            priority,
        };
        let email = diesel::insert_into(email::table)
            .values(new_row)
            .get_result(conn)?;
        Ok(email)
    }

    pub fn get(
        conn: &mut PgConnection,
        id: &EmailId,
        user_vault_id: &UserVaultId,
    ) -> Result<(Email, UserVault), crate::DbError> {
        use crate::schema::user_vaults;
        let result = email::table
            .inner_join(user_vaults::table)
            .filter(email::id.eq(id))
            .filter(email::user_vault_id.eq(user_vault_id))
            .get_result(conn)?;
        Ok(result)
    }

    pub fn mark_verified(conn: &mut PgConnection, id: &EmailId) -> Result<(), DbError> {
        diesel::update(email::table)
            .filter(email::id.eq(id))
            .set(email::is_verified.eq(true))
            .execute(conn)?;
        Ok(())
    }
}
