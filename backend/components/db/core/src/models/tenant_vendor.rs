use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::tenant_vendor_control;
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
    idology_enabled: bool,
    idology_username: Option<String>,
    idology_e_password: Option<SealedVaultBytes>,
    experian_enabled: bool,
    experian_subscriber_code: Option<String>,
}

impl TenantVendorControl {
    #[tracing::instrument("TenantVendorControl::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        tenant_id: TenantId,
        idology_enabled: bool,
        idology_username: Option<String>,
        idology_e_password: Option<SealedVaultBytes>,
        experian_enabled: bool,
        experian_subscriber_code: Option<String>,
    ) -> DbResult<Self> {
        let new = NewTenantVendorControl {
            tenant_id,
            idology_enabled,
            idology_username,
            idology_e_password,
            experian_enabled,
            experian_subscriber_code,
        };

        let tvc = diesel::insert_into(tenant_vendor_control::table)
            .values(new)
            .get_result(conn)?;

        Ok(tvc)
    }

    #[tracing::instrument("TenantVendorControl::get", skip_all)]
    pub fn get(conn: &mut PgConn, tenant_id: TenantId) -> Result<Option<Self>, crate::DbError> {
        let control: Option<Self> = tenant_vendor_control::table
            .filter(tenant_vendor_control::tenant_id.eq(tenant_id))
            .filter(tenant_vendor_control::deactivated_at.is_null())
            .first(conn)
            .optional()?;
        Ok(control)
    }
}
