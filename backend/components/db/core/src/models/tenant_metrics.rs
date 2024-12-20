use crate::FpResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_metrics;
use diesel::prelude::*;
use newtypes::TenantId;
use newtypes::TenantMetricId;

// This is currently a table to store arbitrary metrics for a tenant.
// We'll use this to store the footprint wrapped metrics for a tenant.
#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = tenant_metrics)]
pub struct TenantMetrics {
    pub id: TenantMetricId,
    pub tenant_id: TenantId,
    pub data: serde_json::Value,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_metrics)]
pub struct NewTenantMetrics {
    pub tenant_id: TenantId,
    pub data: serde_json::Value,
}

impl TenantMetrics {
    #[tracing::instrument("TenantMetrics::get_or_create", skip_all)]
    pub fn create_or_update(conn: &mut PgConn, new_metrics: NewTenantMetrics) -> FpResult<Self> {
        let existing: Option<TenantMetrics> = tenant_metrics::table
            .filter(tenant_metrics::tenant_id.eq(&new_metrics.tenant_id))
            .first(conn)
            .optional()?;

        match existing {
            Some(existing) => Self::update(conn, &existing.id, new_metrics.data),
            None => {
                let result = diesel::insert_into(tenant_metrics::table)
                    .values(new_metrics)
                    .get_result(conn)?;
                Ok(result)
            }
        }
    }

    #[tracing::instrument("TenantMetrics::update", skip_all)]
    fn update(conn: &mut PgConn, id: &TenantMetricId, new_data: serde_json::Value) -> FpResult<Self> {
        let result = diesel::update(tenant_metrics::table)
            .filter(tenant_metrics::id.eq(id))
            .set(tenant_metrics::data.eq(new_data))
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("TenantMetrics::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &TenantId) -> FpResult<Self> {
        let result = tenant_metrics::table
            .filter(tenant_metrics::tenant_id.eq(id))
            .first(conn)?;
        Ok(result)
    }
}
