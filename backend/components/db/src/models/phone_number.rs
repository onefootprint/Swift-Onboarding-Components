use crate::schema::{data_lifetime, phone_number};
use crate::PgConn;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::{
    DataLifetimeId, DataPriority, Fingerprint as FingerprintData, IdentityDataKind, PhoneNumberId,
    ScopedUserId, SealedVaultBytes, UserVaultId,
};
use serde::{Deserialize, Serialize};

use crate::{DbResult, HasLifetime, HasSealedIdentityData, TxnPgConn};

use super::{
    data_lifetime::DataLifetime,
    fingerprint::{Fingerprint, NewFingerprint},
};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = phone_number)]
pub struct PhoneNumber {
    pub id: PhoneNumberId,
    pub e_e164: SealedVaultBytes,
    pub e_country: SealedVaultBytes,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub lifetime_id: DataLifetimeId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = phone_number)]
struct NewPhoneNumberRow {
    e_e164: SealedVaultBytes,
    e_country: SealedVaultBytes,
    is_verified: bool,
    priority: DataPriority,
    lifetime_id: DataLifetimeId,
}

#[derive(Debug)]
pub struct NewPhoneNumberArgs {
    pub e_phone_number: SealedVaultBytes,
    pub sh_phone_number: FingerprintData,
    pub e_phone_country: SealedVaultBytes,
}

impl PhoneNumber {
    pub fn list(conn: &mut PgConn, user_vault_id: &UserVaultId) -> DbResult<Vec<Self>> {
        let results = phone_number::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::user_vault_id.eq(user_vault_id))
            .filter(data_lifetime::deactivated_at.is_null())
            .select(phone_number::all_columns)
            .load(conn)?;
        Ok(results)
    }

    pub fn get(
        conn: &mut PgConn,
        phone_number_id: &PhoneNumberId,
        user_vault_id: &UserVaultId,
    ) -> DbResult<Self> {
        let result = phone_number::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::user_vault_id.eq(user_vault_id))
            .filter(phone_number::id.eq(phone_number_id))
            .select(phone_number::all_columns)
            .first(conn)?;
        Ok(result)
    }

    pub fn create_verified(
        conn: &mut TxnPgConn,
        uv_id: &UserVaultId,
        args: NewPhoneNumberArgs,
        priority: DataPriority,
        su_id: Option<&ScopedUserId>,
    ) -> DbResult<PhoneNumber> {
        // Create a portable lifetime - once the phone number is verified and bound to a vault
        // it should be immediately portable, even though it isn't verified by vendors.
        let seqno = DataLifetime::get_next_seqno(conn)?;
        let lifetime = DataLifetime::create(conn, uv_id, su_id, IdentityDataKind::PhoneNumber.into(), seqno)?;
        let seqno = lifetime.created_seqno;
        let lifetime = lifetime.commit(conn, seqno)?;
        let new_row = NewPhoneNumberRow {
            e_e164: args.e_phone_number,
            e_country: args.e_phone_country,
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
            sh_data: args.sh_phone_number,
            kind: IdentityDataKind::PhoneNumber.into(),
            lifetime_id: lifetime.id,
            is_unique: true,
        };
        Fingerprint::bulk_create(conn, vec![new_fingerprint])?;

        Ok(phone_number)
    }
}

impl HasLifetime for PhoneNumber {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    /// Note: only returns primary phone numbers
    fn get_for(conn: &mut PgConn, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
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

impl HasSealedIdentityData for PhoneNumber {
    fn e_data(&self) -> &SealedVaultBytes {
        &self.e_e164
    }
}
