use crate::{schema::email, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::DataAttribute;
use newtypes::{
    DataPriority, EmailId, Fingerprint as FingerprintData, FingerprintId, SealedVaultBytes, UserVaultId,
};
use serde::{Deserialize, Serialize};

use super::fingerprint::Fingerprint;
use super::user_vault::UserVault;
use crate::HasDataAttributeFields;

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

    pub fn get_primary(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> Result<Option<Self>, DbError> {
        tracing::info!("fetching email for user_vault_id");
        let result = email::table
            .filter(email::user_vault_id.eq(user_vault_id))
            .filter(email::deactivated_at.is_null())
            .filter(email::priority.eq(DataPriority::Primary))
            .first(conn)
            .optional()?;
        Ok(result)
    }

    pub fn bulk_get_primary(
        conn: &mut PgConnection,
        user_vault_ids: &Vec<UserVaultId>,
    ) -> Result<Vec<Self>, DbError> {
        tracing::info!("bulk fetching email for user_vault_ids");
        let result = email::table
            .filter(email::user_vault_id.eq_any(user_vault_ids))
            .filter(email::deactivated_at.is_null())
            .filter(email::priority.eq(DataPriority::Primary))
            .load::<Self>(conn)?;

        Ok(result)
    }

    pub fn create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        e_data: SealedVaultBytes,
        fingerprint: FingerprintData,
        is_verified: bool,
        priority: DataPriority,
    ) -> Result<Email, DbError> {
        // TODO: ensure that the fingerprint tuple of (user_vault_id, fingerprint) is unique
        let fingerprint_ids = Fingerprint::bulk_create(
            conn,
            &user_vault_id,
            vec![(DataAttribute::Email, fingerprint, is_verified)],
        )?;
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
        use crate::schema::user_vault;
        let result = email::table
            .inner_join(user_vault::table)
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

    pub fn data_items(self) -> Vec<(DataAttribute, SealedVaultBytes)> {
        vec![(DataAttribute::Email, self.e_data)]
    }
}

impl HasDataAttributeFields for Email {
    fn get_e_field(&self, data_attribute: DataAttribute) -> Option<&SealedVaultBytes> {
        match data_attribute {
            DataAttribute::Email => Some(&self.e_data),
            _ => None,
        }
    }
}
