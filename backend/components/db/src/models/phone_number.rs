use crate::schema::{data_lifetime, phone_number, scoped_user};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{PgConnection, Queryable};
use newtypes::{
    DataAttribute, DataLifetimeId, DataPriority, Fingerprint as FingerprintData, PhoneNumberId,
    SealedVaultBytes, UserVaultId,
};
use serde::{Deserialize, Serialize};

use crate::{DbResult, HasLifetime, TxnPgConnection};

use super::{
    data_lifetime::DataLifetime,
    fingerprint::{Fingerprint, NewFingerprint},
};
use crate::HasDataAttributeFields;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = phone_number)]
pub struct PhoneNumber {
    pub id: PhoneNumberId,
    pub e_e164: SealedVaultBytes,
    pub e_country: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub lifetime_id: DataLifetimeId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = phone_number)]
pub struct NewPhoneNumber {
    pub e_e164: SealedVaultBytes,
    pub e_country: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub lifetime_id: DataLifetimeId,
}

impl PhoneNumber {
    pub fn list(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> DbResult<Vec<Self>> {
        let results = phone_number::table
            .inner_join(data_lifetime::table.inner_join(scoped_user::table))
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .filter(phone_number::deactivated_at.is_null())
            .select(phone_number::all_columns)
            .load(conn)?;
        Ok(results)
    }

    pub fn get(
        conn: &mut PgConnection,
        phone_number_id: &PhoneNumberId,
        user_vault_id: &UserVaultId,
    ) -> DbResult<Self> {
        let result = phone_number::table
            .inner_join(data_lifetime::table.inner_join(scoped_user::table))
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .filter(phone_number::id.eq(phone_number_id))
            .select(phone_number::all_columns)
            .first(conn)?;
        Ok(result)
    }

    pub fn create_verified(
        conn: &mut TxnPgConnection,
        user_vault_id: UserVaultId,
        e_e164: SealedVaultBytes,
        fp_e164: FingerprintData,
        e_country: SealedVaultBytes,
        priority: DataPriority,
    ) -> DbResult<PhoneNumber> {
        // Create a committed lifetime - since the identify flow doesn't have any information
        // on the tenant and requires that the phone number is verified, we will create the phone
        // number as immediately portable, committed data that is not associated with a tenant
        // TODO revisit
        let lifetime = DataLifetime::create(conn, user_vault_id, None)?;
        let seqno = lifetime.created_seqno;
        let lifetime = lifetime.commit(conn, seqno)?;
        let new_row = NewPhoneNumber {
            e_e164,
            e_country,
            is_verified: true,
            priority,
            lifetime_id: lifetime.id.clone(),
        };
        let phone_number = diesel::insert_into(phone_number::table)
            .values(new_row)
            .get_result(conn.conn())?;

        // After inserting the data, also create a fingerprint for this piece of data tied to the
        // same DataLifetime
        let new_fingerprint = NewFingerprint {
            sh_data: fp_e164,
            kind: DataAttribute::PhoneNumber,
            lifetime_id: lifetime.id,
        };
        Fingerprint::bulk_create(conn, vec![new_fingerprint])?;

        Ok(phone_number)
    }

    pub fn data_items(self) -> Vec<(DataAttribute, SealedVaultBytes)> {
        vec![(DataAttribute::PhoneNumber, self.e_e164)]
    }
}

impl HasDataAttributeFields for PhoneNumber {
    fn get_e_field(&self, data_attribute: DataAttribute) -> Option<&SealedVaultBytes> {
        match data_attribute {
            DataAttribute::PhoneNumber => Some(&self.e_e164),
            _ => None,
        }
    }
}

impl HasLifetime for PhoneNumber {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    fn e_data(&self) -> &SealedVaultBytes {
        &self.e_e164
    }
    /// Note: only returns primary phone numbers
    fn get_for(conn: &mut PgConnection, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = phone_number::table
            .filter(phone_number::lifetime_id.eq_any(lifetime_ids))
            .filter(phone_number::priority.eq(DataPriority::Primary))
            .get_results(conn)?;
        Ok(results)
    }
}
