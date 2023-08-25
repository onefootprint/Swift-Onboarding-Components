use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::billing_profile;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::{BillingProfileId, TenantId};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = billing_profile)]
pub struct BillingProfile {
    pub id: BillingProfileId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub tenant_id: TenantId,

    // WARNING: do NOT re-order these columns
    // All in cents
    pub kyc: Option<String>,
    pub kyb: Option<String>,
    pub pii: Option<String>,
    pub id_docs: Option<String>,
    pub watchlist: Option<String>,
    pub hot_vaults: Option<String>,
    pub hot_proxy_vaults: Option<String>,
}

impl BillingProfile {
    pub fn get(conn: &mut PgConn, tenant_id: &TenantId) -> DbResult<Option<Self>> {
        let result = billing_profile::table
            .filter(billing_profile::tenant_id.eq(tenant_id))
            .get_result::<Self>(conn)
            .optional()?;
        Ok(result)
    }
}
