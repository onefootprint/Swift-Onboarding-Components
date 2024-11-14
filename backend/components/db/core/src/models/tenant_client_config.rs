use crate::DbResult;
use crate::NonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_client_config;
use diesel::ExpressionMethods;
use diesel::Insertable;
use diesel::OptionalExtension;
use diesel::QueryDsl;
use diesel::Queryable;
use diesel::RunQueryDsl;
use newtypes::TenantClientConfigId;
use newtypes::TenantId;

#[derive(Debug, Clone, Queryable, PartialEq, Eq)]
#[diesel(table_name = tenant_client_config)]
pub struct TenantClientConfig {
    pub id: TenantClientConfigId,
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub deactivated_at: Option<DateTime<Utc>>,
    #[diesel(deserialize_as = NonNullVec<String>)]
    pub allowed_origins: Vec<String>,
}

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = tenant_client_config)]
pub struct UpdateTenantClientConfig {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub allowed_origins: Vec<String>,
}

impl UpdateTenantClientConfig {
    #[tracing::instrument("UpdateTenantClientConfig::create", skip_all)]
    pub fn create_or_update(self, conn: &mut TxnPgConn) -> DbResult<TenantClientConfig> {
        // deactivate the old ones
        // this lets us keep a record of old values for security context
        diesel::update(tenant_client_config::table)
            .filter(tenant_client_config::tenant_id.eq(&self.tenant_id))
            .filter(tenant_client_config::deactivated_at.is_null())
            .filter(tenant_client_config::is_live.eq(&self.is_live))
            .set(tenant_client_config::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        // insert the new one
        let config = diesel::insert_into(tenant_client_config::table)
            .values(self)
            .get_result(conn.conn())?;

        Ok(config)
    }
}

impl TenantClientConfig {
    #[tracing::instrument("TenantClientConfig::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> Result<Option<Self>, crate::DbError> {
        let control: Option<Self> = tenant_client_config::table
            .filter(tenant_client_config::tenant_id.eq(tenant_id))
            .filter(tenant_client_config::deactivated_at.is_null())
            .filter(tenant_client_config::is_live.eq(is_live))
            .first(conn)
            .optional()?;
        Ok(control)
    }
}
