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
    /// This is a misnomer now - it used to mean that the sh_data for this Fingerprint was unique,
    /// but we no longer enforce uniqueness anymore.
    /// But, we keep it around because there was some business logic that would branch based on
    /// `is_unique`. Will remove in the future
    pub is_unique: bool,
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

    #[tracing::instrument("Fingerprint::create", skip_all)]
    pub fn mark_global_unique(conn: &mut TxnPgConn, lifetime_id: &DataLifetimeId) -> DbResult<()> {
        diesel::update(fingerprint::table)
            .filter(fingerprint::lifetime_id.eq(lifetime_id))
            .filter(fingerprint::scope.eq(FingerprintScopeKind::Global))
            .set(fingerprint::is_unique.eq(true))
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
