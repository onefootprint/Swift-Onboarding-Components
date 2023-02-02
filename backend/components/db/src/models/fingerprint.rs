use crate::schema::data_lifetime;
use crate::schema::fingerprint;
use chrono::{DateTime, Utc};
use diesel::dsl::count_distinct;
use diesel::prelude::*;
use crate::PgConn;
use diesel::Queryable;
use newtypes::{DataLifetimeId, DataLifetimeKind, Fingerprint as FingerprintData, FingerprintId};
use serde::{Deserialize, Serialize};

use crate::{DbResult, TxnPgConn};

// TODO eventually, we'll need to mandate that certain pieces of data have unique fingerprints per user vault (like phone numbers)
#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = fingerprint)]
pub struct Fingerprint {
    pub id: FingerprintId,
    pub sh_data: FingerprintData,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    /// Denormalized from the DataLifetime table in order to add uniqueness constraints on fingerprints
    pub kind: DataLifetimeKind,
    pub lifetime_id: DataLifetimeId,
    /// For rows with is_unique, a db-level constraint enforces that no two rows have the same
    /// fingerprint for the same kind
    pub is_unique: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = fingerprint)]
pub struct NewFingerprint {
    pub sh_data: FingerprintData,
    pub kind: DataLifetimeKind,
    pub lifetime_id: DataLifetimeId,
    pub is_unique: bool,
}

pub type IsUnique = bool;

impl Fingerprint {
    pub fn bulk_create(conn: &mut TxnPgConn, fingerprints: Vec<NewFingerprint>) -> DbResult<()> {
        // Alert if we see multiple user vaults with the same information
        let new_sh_data = fingerprints.iter().map(|f| f.sh_data.clone()).collect();
        let existing_fingerprints_result = Self::bulk_check_if_exists(conn.conn(), new_sh_data);
        match existing_fingerprints_result {
            Ok(existing_fingerprints) => {
                existing_fingerprints.into_iter().filter(|(kind, count)| {
                    *count > 1 && 
                    // not all DLKs we 1) fingerprint and 2) we expect to be unique
                        match kind {
                            DataLifetimeKind::Id(k) => k.potentially_should_have_unique_fingerprint(),
                            _ => false
                        }
                    }
                ).for_each(|(kind, count)| {
                    tracing::warn!(kind=%kind, count=%count, "same fingerprints used across distinct UserVaults")
                });
            }
            Err(e) => {
                tracing::warn!(e=%e, "query for duplicate fingerprints failed")
            }
        } 

        diesel::insert_into(fingerprint::table)
            .values(fingerprints)
            .execute(conn.conn())?;
        Ok(())
    }

    fn bulk_check_if_exists(
        conn: &mut PgConn,
        sh_datas: Vec<FingerprintData>,
    ) -> DbResult<Vec<(DataLifetimeKind, i64)>> {
        let res: Vec<(DataLifetimeKind, i64)> = fingerprint::table
            .filter(fingerprint::sh_data.eq_any(sh_datas))
            .inner_join(data_lifetime::table)
            .group_by(fingerprint::kind)
            .select((fingerprint::kind, count_distinct(data_lifetime::user_vault_id)))
            .get_results(conn)?;

        Ok(res)
    }
}
