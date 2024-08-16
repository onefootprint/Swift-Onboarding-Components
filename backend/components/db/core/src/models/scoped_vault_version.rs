use super::data_lifetime::DataLifetime;
use crate::DbError;
use crate::DbResult;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::data_lifetime;
use db_schema::schema::scoped_vault_version;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;
use newtypes::ScopedVaultId;
use newtypes::ScopedVaultVersionId;
use newtypes::ScopedVaultVersionNumber;

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = scoped_vault_version)]
pub struct ScopedVaultVersion {
    pub id: ScopedVaultVersionId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub scoped_vault_id: ScopedVaultId,
    pub seqno: DataLifetimeSeqno,
    pub version: ScopedVaultVersionNumber,
}

#[derive(Clone, Insertable)]
#[diesel(table_name = scoped_vault_version)]
struct NewScopedVaultVersion {
    pub scoped_vault_id: ScopedVaultId,
    pub seqno: DataLifetimeSeqno,
    pub version: ScopedVaultVersionNumber,
}

impl ScopedVaultVersion {
    // Called only from contexts where we hold a lock on ScopedVault.
    //
    // However, even if we didn't have a lock, the table constraints would still ensure that we
    // don't assign two different versions to the same scoped_vault_id/seqno, or two different
    // seqnos to the same scoped_vault_id. We read the latest version number for a scoped_vault_id,
    // increment it by 1, and write back to the table. Multiple such transactions running
    // concurrently with read committed isolation, hypothetically without a locked ScopedVault,
    // would race to write the row for the next version number. However, only one would succeed,
    // and the rest would fail with constraint violations. The ScopedVault lock prevents the race &
    // constraint
    // violations.
    pub fn get_or_create(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Self> {
        let existing: Option<Self> = scoped_vault_version::table
            .filter(scoped_vault_version::scoped_vault_id.eq(scoped_vault_id))
            .filter(scoped_vault_version::seqno.eq(seqno))
            .get_result(conn.conn())
            .optional()?;

        if let Some(existing) = existing {
            return Ok(existing);
        }

        // Since the backfill may or may not be finished for this scoped vault, we need to
        // determine the next version number using the same methodology as the backfill.

        // Temporary methodology during backfill:
        // ----------------------------

        let dls: Vec<DataLifetime> = data_lifetime::table
            .filter(data_lifetime::scoped_vault_id.eq(scoped_vault_id))
            .select(DataLifetime::as_select())
            .get_results(conn.conn())?;

        let created_seqnos = dls.iter().map(|dl| dl.created_seqno);
        let deactivated_seqnos = dls.iter().flat_map(|dl| dl.deactivated_seqno);
        let num_seqnos = created_seqnos
            .chain(deactivated_seqnos)
            // Filter out the seqno we're operating on, since in some cases we insert
            // data_lifetimes before we insert the scoped_vault_version.
            .filter(|s| *s != seqno)
            .unique()
            .count();

        let num_seqnos: i64 = num_seqnos
            .try_into()
            .map_err(|e| DbError::AssertionError(format!("num_seqnos is out of bounds for an i64: {}", e)))?;
        let version = ScopedVaultVersionNumber::from(num_seqnos) + ScopedVaultVersionNumber::from(1);


        // Switch to this methodology after the backfill:
        // ----------------------------------------------
        //
        // let latest_row: Option<Self> = scoped_vault_version::table
        //     .filter(scoped_vault_version::scoped_vault_id.eq(scoped_vault_id))
        //     .order(scoped_vault_version::version.desc())
        //     .limit(1)
        //     .get_result(conn.conn())
        //     .optional()?;

        // let version = if let Some(latest_row) = latest_row {
        //     if seqno <= latest_row.seqno {
        //         return Err(DbError::AssertionError(
        //             "seqnos must increment with each scoped vault version".to_owned(),
        //         ));
        //     }

        //     latest_row.version + ScopedVaultVersionNumber::from(1)
        // } else {
        //     ScopedVaultVersionNumber::from(1)
        // };

        let new = NewScopedVaultVersion {
            scoped_vault_id: scoped_vault_id.clone(),
            seqno,
            version,
        };
        let result = diesel::insert_into(scoped_vault_version::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }
}
