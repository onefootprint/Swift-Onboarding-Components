use crate::{
    DbResult,
    PgConn,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema::proxy_request_log;
use diesel::prelude::*;
use diesel::{
    Identifiable,
    Insertable,
    Queryable,
};
use newtypes::{
    ProxyConfigId,
    ProxyRequestLogId,
    SealedVaultBytes,
    TenantId,
};

#[derive(Queryable, Debug, Clone, Identifiable)]
#[diesel(table_name = proxy_request_log)]
pub struct ProxyRequestLog {
    pub id: ProxyRequestLogId,
    pub tenant_id: TenantId,
    pub config_id: Option<ProxyConfigId>,
    pub e_url: SealedVaultBytes,
    pub method: String,
    pub sent_at: DateTime<Utc>,
    pub received_at: Option<DateTime<Utc>>,
    pub status_code: Option<i32>,
    pub e_request_data: SealedVaultBytes,
    pub e_response_data: Option<SealedVaultBytes>,
    pub request_error: Option<String>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = proxy_request_log)]
pub struct NewProxyRequestLog {
    pub tenant_id: TenantId,
    pub config_id: Option<ProxyConfigId>,
    pub e_url: SealedVaultBytes,
    pub method: String,
    pub sent_at: DateTime<Utc>,
    pub e_request_data: SealedVaultBytes,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = proxy_request_log)]
pub struct FinishedRequestLog {
    pub received_at: DateTime<Utc>,
    pub status_code: Option<i32>,
    pub e_response_data: Option<SealedVaultBytes>,
    pub request_error: Option<String>,
}

impl ProxyRequestLog {
    /// create a new request log
    #[tracing::instrument("ProxyRequestLog::create_new", skip_all)]
    pub fn create_new(conn: &mut PgConn, new: NewProxyRequestLog) -> DbResult<Self> {
        let log = diesel::insert_into(proxy_request_log::table)
            .values(new)
            .get_result(conn)?;

        Ok(log)
    }

    /// create a new request log
    #[tracing::instrument("ProxyRequestLog::finish_request", skip_all)]
    pub fn finish_request(&self, conn: &mut PgConn, update: FinishedRequestLog) -> DbResult<Self> {
        let result = diesel::update(proxy_request_log::table)
            .filter(proxy_request_log::id.eq(&self.id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }
}
