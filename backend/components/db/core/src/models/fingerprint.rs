use std::collections::HashMap;

use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::data_lifetime;
use db_schema::schema::fingerprint;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::FingerprintScopeKind;
use newtypes::FingerprintVersion;
use newtypes::ScopedVaultId;
use newtypes::{DataIdentifier, DataLifetimeId, Fingerprint as FingerprintData, FingerprintId};
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
    pub kind: DataIdentifier,
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
    pub kind: DataIdentifier,
    pub lifetime_id: DataLifetimeId,
    pub is_unique: bool,
    pub version: FingerprintVersion,
    pub scope: FingerprintScopeKind,
}

pub type IsUnique = bool;
pub type DuplicateExistingFingerprintsByDLK = HashMap<DataIdentifier, i64>;
impl Fingerprint {
    #[tracing::instrument("Fingerprint::create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, fingerprints: Vec<NewFingerprint>) -> DbResult<()> {
        diesel::insert_into(fingerprint::table)
            .values(fingerprints)
            .execute(conn.conn())?;
        Ok(())
    }

    // for tests
    #[tracing::instrument("Fingerprint::_list_for_scoped_vault", skip_all)]
    pub fn _list_for_scoped_vault(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<Vec<Self>> {
        let results = fingerprint::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::scoped_vault_id.eq(sv_id))
            .select(fingerprint::all_columns)
            .get_results(conn)?;
        Ok(results)
    }
}
