use crate::errors::AssertionError;
use crate::{
    DbResult,
    PgConn,
    TxnPgConn,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema::{
    vault_dr_aws_pre_enrollment,
    vault_dr_config,
};
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::{
    Locked,
    PiiString,
    TenantId,
    VaultDrAwsPreEnrollmentId,
    VaultDrConfigId,
};

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = vault_dr_aws_pre_enrollment)]
pub struct VaultDrAwsPreEnrollment {
    pub id: VaultDrAwsPreEnrollmentId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub tenant_id: TenantId,
    pub is_live: bool,
    pub aws_external_id: PiiString,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_dr_aws_pre_enrollment)]
pub struct NewVaultDrAwsPreEnrollment<'a> {
    pub tenant_id: &'a TenantId,
    pub is_live: bool,
    pub aws_external_id: PiiString,
}

impl VaultDrAwsPreEnrollment {
    pub fn get(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> DbResult<Option<Self>> {
        Ok(vault_dr_aws_pre_enrollment::table
            .filter(vault_dr_aws_pre_enrollment::tenant_id.eq(tenant_id))
            .filter(vault_dr_aws_pre_enrollment::is_live.eq(is_live))
            .first(conn)
            .optional()?)
    }

    pub fn get_or_create(conn: &mut TxnPgConn, new: NewVaultDrAwsPreEnrollment) -> DbResult<Self> {
        if let Some(existing) = Self::get(conn.conn(), new.tenant_id, new.is_live)? {
            return Ok(existing);
        }

        // Try to insert the new record.
        diesel::insert_into(vault_dr_aws_pre_enrollment::table)
            .values(&new)
            .on_conflict_do_nothing()
            .execute(conn.conn())?;

        // Re-fetch the record. May be a record inserted by a different transaction.
        let result = Self::get(conn.conn(), new.tenant_id, new.is_live)?.ok_or(AssertionError(
            "upsert of Vault DR AWS pre-enrollment yielded no records",
        ))?;

        Ok(result)
    }
}

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = vault_dr_config)]
pub struct VaultDrConfig {
    pub id: VaultDrConfigId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,

    pub tenant_id: TenantId,
    pub is_live: bool,

    pub aws_pre_enrollment_id: VaultDrAwsPreEnrollmentId,
    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    pub org_public_key: String,
    pub recovery_public_key: String,
    pub wrapped_recovery_key: String,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_dr_config)]
pub struct NewVaultDrConfig<'a> {
    pub created_at: DateTime<Utc>,

    pub tenant_id: &'a TenantId,
    pub is_live: bool,

    pub aws_pre_enrollment_id: &'a VaultDrAwsPreEnrollmentId,
    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    pub org_public_key: String,
    pub recovery_public_key: String,
    pub wrapped_recovery_key: String,
}

impl VaultDrConfig {
    pub fn get(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> DbResult<Option<Self>> {
        Ok(vault_dr_config::table
            .filter(vault_dr_config::tenant_id.eq(tenant_id))
            .filter(vault_dr_config::is_live.eq(is_live))
            .filter(vault_dr_config::deactivated_at.is_null())
            .first(conn)
            .optional()?)
    }

    pub fn lock(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> DbResult<Option<Locked<Self>>> {
        let result = vault_dr_config::table
            .filter(vault_dr_config::tenant_id.eq(tenant_id))
            .filter(vault_dr_config::is_live.eq(is_live))
            .filter(vault_dr_config::deactivated_at.is_null())
            .for_no_key_update()
            .first(conn)
            .optional()?;

        Ok(result.map(Locked::new))
    }

    pub fn create(conn: &mut TxnPgConn, new: NewVaultDrConfig) -> DbResult<Locked<Self>> {
        let result = diesel::insert_into(vault_dr_config::table)
            .values(&new)
            .get_result(conn.conn())?;

        Ok(Locked::new(result))
    }

    pub fn deactivate(conn: &mut TxnPgConn, config: Locked<Self>) -> DbResult<()> {
        diesel::update(vault_dr_config::table)
            .filter(vault_dr_config::id.eq(&config.id))
            .filter(vault_dr_config::deactivated_at.is_null())
            .set(vault_dr_config::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        Ok(())
    }
}
