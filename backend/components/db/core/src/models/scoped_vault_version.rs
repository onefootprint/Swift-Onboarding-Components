use super::data_lifetime::DataLifetime;
use super::data_lifetime::DataLifetimeSeqnoTxn;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::scoped_vault_version;
use diesel::prelude::*;
use newtypes::DataLifetimeSeqno;
use newtypes::ScopedVaultId;
use newtypes::ScopedVaultVersionId;
use newtypes::ScopedVaultVersionNumber;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = scoped_vault_version)]
pub struct ScopedVaultVersion {
    pub id: ScopedVaultVersionId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub scoped_vault_id: ScopedVaultId,
    pub seqno: DataLifetimeSeqno,
    pub version: ScopedVaultVersionNumber,

    pub tenant_id: TenantId,
    pub is_live: bool,

    /// This field defaults to null until a Vault Disaster Recovery worker has backed up the Scoped
    /// Vault Version. The VDR worker annotates the row with the corresponding VDR Config. Note that
    /// this design requires that there is at most one active VDR Config per (tenant_id, is_live).
    pub backed_up_by_vdr_config_id: Option<VaultDrConfigId>,
}

#[derive(Clone, Insertable)]
#[diesel(table_name = scoped_vault_version)]
struct NewScopedVaultVersion {
    pub scoped_vault_id: ScopedVaultId,
    pub seqno: DataLifetimeSeqno,
    pub version: ScopedVaultVersionNumber,
    pub tenant_id: TenantId,
    pub is_live: bool,
}

impl ScopedVaultVersion {
    #[tracing::instrument("ScopedVaultVersion::get_or_create", skip_all)]
    pub fn get_or_create(conn: &mut TxnPgConn, sv_txn: &DataLifetimeSeqnoTxn<'_>) -> DbResult<Self> {
        let scoped_vault = sv_txn.scoped_vault();
        let seqno = sv_txn.seqno();

        let scoped_vault_id = &scoped_vault.id;
        let tenant_id = scoped_vault.tenant_id.clone();
        let is_live = scoped_vault.is_live;

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
            // Note that we start from 1. A value of zero is reserved for vaults without associated
            // DataLifetimes.
            ScopedVaultVersionNumber::from(1)
        };

        let new = NewScopedVaultVersion {
            scoped_vault_id: scoped_vault_id.clone(),
            seqno,
            version,
            tenant_id,
            is_live,
        };
        let result = diesel::insert_into(scoped_vault_version::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("ScopedVaultVersion::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        version: ScopedVaultVersionNumber,
    ) -> DbResult<Self> {
        let result = scoped_vault_version::table
            .filter(scoped_vault_version::scoped_vault_id.eq(sv_id))
            .filter(scoped_vault_version::version.eq(version))
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("ScopedVaultVersion::get_seqno", skip_all)]
    pub fn get_seqno(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        version: ScopedVaultVersionNumber,
    ) -> DbResult<DataLifetimeSeqno> {
        if version == 0.into() {
            // A version number of 0 represents the state of the vault with no
            // DLs. Translate this into a seqno of 0, which is before all DLs.
            Ok(DataLifetimeSeqno::from(0))
        } else {
            let svv: ScopedVaultVersion = scoped_vault_version::table
                .filter(scoped_vault_version::scoped_vault_id.eq(sv_id))
                .filter(scoped_vault_version::version.eq(version))
                .get_result(conn)?;
            Ok(svv.seqno)
        }
    }

    #[tracing::instrument("ScopedVaultVersion::latest_version_number", skip_all)]
    pub fn latest_version_number(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
    ) -> DbResult<ScopedVaultVersionNumber> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        Self::version_number_at_seqno(conn, sv_id, seqno)
    }

    #[tracing::instrument("ScopedVaultVersion::version_number_at_seqno", skip_all)]
    pub fn version_number_at_seqno(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<ScopedVaultVersionNumber> {
        let existing_version: Option<ScopedVaultVersion> = scoped_vault_version::table
            .filter(scoped_vault_version::scoped_vault_id.eq(sv_id))
            .filter(scoped_vault_version::seqno.le(seqno))
            .select(ScopedVaultVersion::as_select())
            .order(scoped_vault_version::seqno.desc())
            .limit(1)
            .get_result(conn)
            .optional()?;

        // Default to 0 if no scoped vault version exists at the given seqno.
        // A version of zero represents the vault before data was added.
        Ok(existing_version
            .map(|v| v.version)
            .unwrap_or(ScopedVaultVersionNumber::from(0)))
    }

    #[tracing::instrument("ScopedVaultVersion::bulk_update_backed_up_by_vdr_config_id", skip_all)]
    pub fn bulk_update_backed_up_by_vdr_config_id(
        conn: &mut TxnPgConn,
        svv_ids: &[ScopedVaultVersionId],
        config_id: &VaultDrConfigId,
    ) -> DbResult<()> {
        let num_updated = diesel::update(scoped_vault_version::table)
            .filter(scoped_vault_version::id.eq_any(svv_ids))
            .set(scoped_vault_version::backed_up_by_vdr_config_id.eq(Some(config_id)))
            .execute(conn.conn())?;

        // Assert that svv_ids were all valid.
        if num_updated != svv_ids.len() {
            return Err(DbError::AssertionError(format!(
                "ScopedVaultVersion::bulk_update_backed_up_by_vdr_config_id expected to update {} rows, but updated {}",
                svv_ids.len(),
                num_updated
            )));
        }

        Ok(())
    }
}
