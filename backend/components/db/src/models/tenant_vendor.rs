use crate::schema::tenant_vendor_control;
use crate::PgConn;
use chrono::{DateTime, Utc};
use diesel::ExpressionMethods;
use diesel::{Insertable, OptionalExtension, QueryDsl, Queryable, RunQueryDsl};
use newtypes::{SealedVaultBytes, TenantId, TenantVendorControlId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, PartialEq, Eq)]
#[diesel(table_name = tenant_vendor_control)]
pub struct TenantVendorControl {
    pub id: TenantVendorControlId,
    pub tenant_id: TenantId,
    pub deactivated_at: Option<DateTime<Utc>>,

    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub idology_enabled: bool,
    pub idology_username: Option<String>,
    pub idology_e_password: Option<SealedVaultBytes>,

    pub experian_enabled: bool,
    pub experian_subscriber_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_vendor_control)]
struct NewTenantVendorControl {
    tenant_id: TenantId,
}

impl TenantVendorControl {
    #[tracing::instrument(skip_all)]
    pub fn create(conn: &mut PgConn, tenant_id: TenantId) -> Result<(), crate::DbError> {
        let new = NewTenantVendorControl { tenant_id };

        diesel::insert_into(tenant_vendor_control::table)
            .values(new)
            .execute(conn)?;

        Ok(())
    }

    #[tracing::instrument(skip_all)]
    pub fn get(conn: &mut PgConn, tenant_id: TenantId) -> Result<Option<Self>, crate::DbError> {
        let control: Option<Self> = tenant_vendor_control::table
            .filter(tenant_vendor_control::tenant_id.eq(tenant_id))
            .filter(tenant_vendor_control::deactivated_at.is_null())
            .first(conn)
            .optional()?;
        Ok(control)
    }
}
