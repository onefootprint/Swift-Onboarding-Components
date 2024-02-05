use std::collections::HashMap;

use chrono::{DateTime, Utc};
use db_schema::schema::fingerprint;
use diesel::{prelude::*, Queryable};
use itertools::Itertools;
use newtypes::{
    DataIdentifier, DataLifetimeId, Fingerprint as FingerprintData, FingerprintId, FingerprintScopeKind,
    FingerprintVersion,
};

use crate::{DbResult, TxnPgConn};

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
    /// True if we want to hide this fingerprint from search results.
    /// This is only set manually through a dbshell
    pub is_hidden: bool,
}

#[derive(Debug, Clone)]
pub struct NewFingerprintArgs {
    pub sh_data: FingerprintData,
    pub kind: DataIdentifier,
    pub lifetime_id: DataLifetimeId,
    pub version: FingerprintVersion,
    pub scope: FingerprintScopeKind,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = fingerprint)]
struct NewFingerprintRow {
    sh_data: FingerprintData,
    kind: DataIdentifier,
    lifetime_id: DataLifetimeId,
    version: FingerprintVersion,
    scope: FingerprintScopeKind,
    is_hidden: bool,
}

pub type IsUnique = bool;
pub type DuplicateExistingFingerprintsByDLK = HashMap<DataIdentifier, i64>;
impl Fingerprint {
    #[tracing::instrument("Fingerprint::create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, fingerprints: Vec<NewFingerprintArgs>) -> DbResult<()> {
        for fp in fingerprints.iter() {
            if !fp.kind.is_fingerprintable() {
                tracing::error!(di=%fp.kind, "Fingerprinting DI that is not fingerprintable");
            }
            if fp.scope == FingerprintScopeKind::Global && !fp.kind.is_globally_fingerprintable() {
                tracing::error!(di=%fp.kind, "Fingerprinting DI that is not globally fingerprintable");
            }
        }
        let fingerprints = fingerprints
            .into_iter()
            .map(
                |NewFingerprintArgs {
                     sh_data,
                     kind,
                     lifetime_id,
                     version,
                     scope,
                 }| NewFingerprintRow {
                    sh_data,
                    kind,
                    lifetime_id,
                    version,
                    scope,
                    is_hidden: false,
                },
            )
            .collect_vec();
        diesel::insert_into(fingerprint::table)
            .values(fingerprints)
            .execute(conn.conn())?;
        Ok(())
    }
}
