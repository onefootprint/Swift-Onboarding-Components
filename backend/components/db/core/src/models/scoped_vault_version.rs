use super::scoped_vault::ScopedVault;
use crate::DbError;
use crate::DbResult;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::scoped_vault_version;
use diesel::prelude::*;
use newtypes::DataLifetimeSeqno;
use newtypes::Locked;
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
    pub fn get_or_create(
        conn: &mut TxnPgConn,
        scoped_vault: &Locked<ScopedVault>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Self> {
        let scoped_vault_id = &scoped_vault.id;

        let existing: Option<Self> = scoped_vault_version::table
            .filter(scoped_vault_version::scoped_vault_id.eq(scoped_vault_id))
            .filter(scoped_vault_version::seqno.eq(seqno))
            .get_result(conn.conn())
            .optional()?;

        if let Some(existing) = existing {
            return Ok(existing);
        }

        let latest_row: Option<Self> = scoped_vault_version::table
            .filter(scoped_vault_version::scoped_vault_id.eq(scoped_vault_id))
            .order(scoped_vault_version::version.desc())
            .limit(1)
            .get_result(conn.conn())
            .optional()?;

        let version = if let Some(latest_row) = latest_row {
            if seqno <= latest_row.seqno {
                return Err(DbError::AssertionError(
                    "seqnos must increment with each scoped vault version".to_owned(),
                ));
            }

            latest_row.version + ScopedVaultVersionNumber::from(1)
        } else {
            ScopedVaultVersionNumber::from(1)
        };

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
