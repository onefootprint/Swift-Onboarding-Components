use crate::schema::fingerprint;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::{DataLifetimeId, DataLifetimeKind, Fingerprint as FingerprintData, FingerprintId};
use serde::{Deserialize, Serialize};

use crate::{DbResult, TxnPgConnection};

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
    pub fn bulk_create(conn: &mut TxnPgConnection, fingerprints: Vec<NewFingerprint>) -> DbResult<()> {
        diesel::insert_into(fingerprint::table)
            .values(fingerprints)
            .execute(conn.conn())?;
        Ok(())
    }
}
