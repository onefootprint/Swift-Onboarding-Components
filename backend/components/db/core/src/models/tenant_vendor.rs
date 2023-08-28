use crate::{DbResult, PgConn, TxnPgConn};
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

    pub experian_enabled: bool,
    pub experian_subscriber_code: Option<String>,

    pub middesk_api_key: Option<SealedVaultBytes>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_vendor_control)]
struct NewTenantVendorControl {
    tenant_id: TenantId,
    idology_enabled: bool,
    experian_enabled: bool,
    experian_subscriber_code: Option<String>,
    middesk_api_key: Option<SealedVaultBytes>,
}

impl TenantVendorControl {
    #[tracing::instrument("TenantVendorControl::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        tenant_id: TenantId,
        idology_enabled: bool,
        experian_enabled: bool,
        experian_subscriber_code: Option<String>,
        middesk_api_key: Option<SealedVaultBytes>,
    ) -> DbResult<Self> {
        let new = NewTenantVendorControl {
            tenant_id: tenant_id.clone(),
            idology_enabled,
            experian_enabled,
            experian_subscriber_code,
            middesk_api_key,
        };
        diesel::update(tenant_vendor_control::table)
            .filter(tenant_vendor_control::tenant_id.eq(&tenant_id))
            .set(tenant_vendor_control::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        let tvc = diesel::insert_into(tenant_vendor_control::table)
            .values(new)
            .get_result(conn.conn())?;

        Ok(tvc)
    }

    #[tracing::instrument("TenantVendorControl::get", skip_all)]
    pub fn get(conn: &mut PgConn, tenant_id: TenantId) -> Result<Option<Self>, crate::DbError> {
        let control: Option<Self> = tenant_vendor_control::table
            .filter(tenant_vendor_control::tenant_id.eq(tenant_id))
            .filter(tenant_vendor_control::deactivated_at.is_null())
            .order_by(tenant_vendor_control::_created_at.desc())
            .first(conn)
            .optional()?;
        Ok(control)
    }
}
