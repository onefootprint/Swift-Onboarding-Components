use crate::schema::phone_number;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{PgConnection, Queryable};
use newtypes::{
    DataAttribute, DataPriority, Fingerprint as FingerprintData, FingerprintId, PhoneNumberId,
    SealedVaultBytes, UserVaultId,
};
use serde::{Deserialize, Serialize};

use crate::DbError;

use super::fingerprint::Fingerprint;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = phone_number)]
pub struct PhoneNumber {
    pub id: PhoneNumberId,
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_e164: SealedVaultBytes,
    pub e_country: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = phone_number)]
pub struct NewPhoneNumber {
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_e164: SealedVaultBytes,
    pub e_country: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
}

impl PhoneNumber {
    pub fn list(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Vec<Self>, DbError> {
        let results = phone_number::table
            .filter(phone_number::user_vault_id.eq(user_vault_id))
            .filter(phone_number::deactivated_at.is_null())
            .load(conn)?;
        Ok(results)
    }

    pub fn get_primary(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> Result<Option<Self>, DbError> {
        let result = phone_number::table
            .filter(phone_number::user_vault_id.eq(user_vault_id))
            .filter(phone_number::deactivated_at.is_null())
            .filter(phone_number::priority.eq(DataPriority::Primary))
            .first(conn)
            .optional()?;
        Ok(result)
    }

    pub fn get_by_id(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
        phone_number_id: &PhoneNumberId,
    ) -> Result<Self, DbError> {
        let result = phone_number::table
            .filter(phone_number::user_vault_id.eq(user_vault_id))
            .filter(phone_number::id.eq(phone_number_id))
            .first(conn)?;
        Ok(result)
    }

    pub fn create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        e_e164: SealedVaultBytes,
        fp_e164: FingerprintData,
        e_country: SealedVaultBytes,
        is_verified: bool,
        priority: DataPriority,
    ) -> Result<PhoneNumber, DbError> {
        let fingerprint_ids = Fingerprint::bulk_create(
            conn,
            &user_vault_id,
            vec![(DataAttribute::PhoneNumber, fp_e164, is_verified)],
        )?;

        let new_row = NewPhoneNumber {
            user_vault_id,
            fingerprint_ids,
            e_e164,
            e_country,
            is_verified,
            priority,
        };
        let phone_number = diesel::insert_into(phone_number::table)
            .values(new_row)
            .get_result(conn)?;
        Ok(phone_number)
    }

    pub fn data_items(self) -> Vec<(DataAttribute, SealedVaultBytes)> {
        vec![(DataAttribute::PhoneNumber, self.e_e164)]
    }
}
