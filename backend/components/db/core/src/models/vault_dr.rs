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
use db_schema::schema::vault_dr_aws_pre_enrollment;
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::{
    PiiString,
    TenantId,
    VaultDrAwsPreEnrollmentId,
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
