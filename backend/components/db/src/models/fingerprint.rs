use std::collections::HashMap;

use crate::schema::data_lifetime;
use crate::schema::fingerprint;
use crate::PgConn;
use chrono::{DateTime, Utc};
use diesel::dsl::count_distinct;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::FingerprintScopeKind;
use newtypes::FingerprintVersion;
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
    /// Version of the fingerprint schema
    pub version: FingerprintVersion,
    /// scope to which fingerprint was created for
    pub scope: FingerprintScopeKind,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = fingerprint)]
pub struct NewFingerprint {
    pub sh_data: FingerprintData,
    pub kind: DataLifetimeKind,
    pub lifetime_id: DataLifetimeId,
    pub is_unique: bool,
    pub version: FingerprintVersion,
    pub scope: FingerprintScopeKind,
}

pub type IsUnique = bool;
pub type DuplicateExistingFingerprintsByDLK = HashMap<DataLifetimeKind, i64>;
impl Fingerprint {
    #[tracing::instrument(skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        fingerprints: Vec<NewFingerprint>,
    ) -> DbResult<DuplicateExistingFingerprintsByDLK> {
        // Alert if we see multiple user vaults with the same information
        let new_sh_data = fingerprints.iter().map(|f| f.sh_data.clone()).collect();
        let existing_fingerprints_result = Self::bulk_check_if_exists(conn.conn(), new_sh_data);
        let duplicates = match existing_fingerprints_result {
            Ok(existing_fingerprints) => HashMap::from_iter(existing_fingerprints.into_iter()),
            Err(e) => {
                tracing::warn!(e=%e, "query for duplicate fingerprints failed");
                HashMap::new()
            }
        };

        diesel::insert_into(fingerprint::table)
            .values(fingerprints)
            .execute(conn.conn())?;
        Ok(duplicates)
    }

    #[tracing::instrument(skip_all)]
    fn bulk_check_if_exists(
        conn: &mut PgConn,
        sh_datas: Vec<FingerprintData>,
    ) -> DbResult<Vec<(DataLifetimeKind, i64)>> {
        let res: Vec<(DataLifetimeKind, i64)> = fingerprint::table
            .filter(fingerprint::sh_data.eq_any(sh_datas))
            .inner_join(data_lifetime::table)
            .group_by(fingerprint::kind)
            .select((fingerprint::kind, count_distinct(data_lifetime::vault_id)))
            .get_results(conn)?;

        Ok(res)
    }
}
