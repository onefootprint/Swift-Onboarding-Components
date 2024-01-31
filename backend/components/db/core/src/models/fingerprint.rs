use std::collections::HashMap;

use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::fingerprint;
use diesel::{prelude::*, Queryable};
use newtypes::{
    DataIdentifier, DataLifetimeId, Fingerprint as FingerprintData, FingerprintId, FingerprintScopeKind,
    FingerprintVersion,
};

use crate::{DbResult, TxnPgConn};

// TODO eventually, we'll need to mandate that certain pieces of data have unique fingerprints per user vault (like phone numbers)
#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = fingerprint)]
pub struct Fingerprint {
    pub id: FingerprintId,
    pub sh_data: FingerprintData,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    /// Denormalized from the DataLifetime table in order to add uniqueness constraints on fingerprints
    pub kind: DataIdentifier,
    pub lifetime_id: DataLifetimeId,
    /// Version of the fingerprint schema
    pub version: FingerprintVersion,
    /// scope to which fingerprint was created for
    pub scope: FingerprintScopeKind,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = fingerprint)]
pub struct NewFingerprint {
    pub sh_data: FingerprintData,
    pub kind: DataIdentifier,
    pub lifetime_id: DataLifetimeId,
    pub version: FingerprintVersion,
    pub scope: FingerprintScopeKind,
}

pub type IsUnique = bool;
pub type DuplicateExistingFingerprintsByDLK = HashMap<DataIdentifier, i64>;
impl Fingerprint {
    #[tracing::instrument("Fingerprint::create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, fingerprints: Vec<NewFingerprint>) -> DbResult<()> {
        for fp in fingerprints.iter() {
            if !fp.kind.is_fingerprintable() {
                tracing::error!(di=%fp.kind, "Fingerprinting DI that is not fingerprintable");
            }
            if fp.scope == FingerprintScopeKind::Global && !fp.kind.is_globally_fingerprintable() {
                tracing::error!(di=%fp.kind, "Fingerprinting DI that is not globally fingerprintable");
            }
        }
        diesel::insert_into(fingerprint::table)
            .values(fingerprints)
            .execute(conn.conn())?;
        Ok(())
    }

    #[tracing::instrument("Fingerprint::bulk_get", skip_all)]
    pub fn bulk_get(conn: &mut PgConn, lifetime_ids: Vec<DataLifetimeId>) -> DbResult<Vec<Self>> {
        let results = fingerprint::table
            .filter(fingerprint::lifetime_id.eq_any(lifetime_ids))
            .get_results(conn)?;
        Ok(results)
    }
}
