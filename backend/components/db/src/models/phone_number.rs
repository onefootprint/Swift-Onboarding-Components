use crate::schema::{data_lifetime, phone_number};
use crate::PgConn;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::{
    DataLifetimeId, DataLifetimeSeqno, DataPriority, Fingerprint as FingerprintData, IdentityDataKind,
    PhoneNumberId, ScopedVaultId, SealedVaultBytes, VaultId,
};
use serde::{Deserialize, Serialize};

use crate::{DbResult, HasLifetime, HasSealedIdentityData, TxnPgConn};

use super::{
    data_lifetime::DataLifetime,
    fingerprint::{Fingerprint, NewFingerprint},
};

// Made private to show not used anymore
#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = phone_number)]
pub(crate) struct PhoneNumber {
    pub id: PhoneNumberId,
    pub e_e164: SealedVaultBytes,
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
    is_verified: bool,
    priority: DataPriority,
    lifetime_id: DataLifetimeId,
}

// Made private to show not used anymore
#[derive(Debug)]
pub(crate) struct NewPhoneNumberArgs {
    #[allow(unused)]
    pub e_phone_number: SealedVaultBytes,
    #[allow(unused)]
    pub sh_phone_number: FingerprintData,
}

impl PhoneNumber {
    #[tracing::instrument(skip_all)]
    pub fn list(conn: &mut PgConn, user_vault_id: &VaultId) -> DbResult<Vec<Self>> {
        let results = phone_number::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::user_vault_id.eq(user_vault_id))
            .filter(data_lifetime::deactivated_at.is_null())
            .select(phone_number::all_columns)
            .load(conn)?;
        Ok(results)
    }

    #[tracing::instrument(skip_all)]
    pub fn get(
        conn: &mut PgConn,
        phone_number_id: &PhoneNumberId,
        user_vault_id: &VaultId,
    ) -> DbResult<Self> {
        let result = phone_number::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::user_vault_id.eq(user_vault_id))
            .filter(phone_number::id.eq(phone_number_id))
            .select(phone_number::all_columns)
            .first(conn)?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        uv_id: &VaultId,
        args: NewPhoneNumberArgs,
        priority: DataPriority,
        su_id: &ScopedVaultId,
        seqno: DataLifetimeSeqno,
        is_unique_fingerprint: bool,
    ) -> DbResult<PhoneNumber> {
        // Create a portable lifetime - once the phone number is verified and bound to a vault
        // it should be immediately portable, even though it isn't verified by vendors.
        let lifetime = DataLifetime::create(conn, uv_id, su_id, IdentityDataKind::PhoneNumber.into(), seqno)?;
        let new_row = NewPhoneNumberRow {
            e_e164: args.e_phone_number,
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
            is_unique: is_unique_fingerprint,
        };
        Fingerprint::bulk_create(conn, vec![new_fingerprint])?;

        Ok(phone_number)
    }

    #[tracing::instrument(skip_all)]
    pub fn create_verified(
        conn: &mut TxnPgConn,
        uv_id: &VaultId,
        args: NewPhoneNumberArgs,
        priority: DataPriority,
        su_id: &ScopedVaultId,
    ) -> DbResult<PhoneNumber> {
        let seqno = DataLifetime::get_next_seqno(conn)?;
        let phone_number = Self::create(conn, uv_id, args, priority, su_id, seqno, true)?;
        // Create a portable lifetime - once the phone number is verified and bound to a vault
        // it should be immediately portable, even though it isn't verified by vendors.
        DataLifetime::portablize(conn, &phone_number.lifetime_id, seqno)?;

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
