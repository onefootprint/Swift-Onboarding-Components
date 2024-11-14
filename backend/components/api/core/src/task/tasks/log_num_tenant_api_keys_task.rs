use crate::task::ExecuteTask;
use api_errors::FpResult;
use async_trait::async_trait;
use db::models::tenant::Tenant;
use db::models::tenant_api_key::ApiKeyListFilters;
use db::models::tenant_api_key::TenantApiKey;
use db::DbError;
use db::DbPool;
use newtypes::LogNumTenantApiKeysArgs;

#[derive(derive_more::Constructor)]
pub(crate) struct LogNumTenantApiKeysTask {
    db_pool: DbPool,
}

#[async_trait]
impl ExecuteTask<LogNumTenantApiKeysArgs> for LogNumTenantApiKeysTask {
    async fn execute(self, args: LogNumTenantApiKeysArgs) -> FpResult<()> {
        let Self { db_pool } = self;
        let LogNumTenantApiKeysArgs { tenant_id, is_live } = args;
        let t_id = tenant_id.clone();
        let cnt = db_pool
            .db_query(move |conn| -> Result<i64, DbError> {
                Tenant::get(conn, &t_id)?; // assert tenant exists

                let filters = ApiKeyListFilters {
                    tenant_id: t_id,
                    is_live,
                    role_ids: None,
                    status: None,
                    search: None,
                };
                let count = TenantApiKey::count(conn, &filters)?;
                Ok(count)
            })
            .await?;

        let log = format!(
            "[LogNumTenantApiKeysTask] tenant_id: {}, is_live: {}, num api keys = {}",
            tenant_id, is_live, cnt
        );
        tracing::info!(log);
        println!("{}", log);
        Ok(())
    }
}
