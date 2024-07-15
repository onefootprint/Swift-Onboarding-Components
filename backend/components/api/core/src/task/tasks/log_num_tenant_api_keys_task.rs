use crate::task::ExecuteTask;
use api_errors::FpResult;
use async_trait::async_trait;
use db::models::tenant::Tenant;
use db::models::tenant_api_key::ApiKeyListFilters;
use db::models::tenant_api_key::TenantApiKey;
use db::DbError;
use db::DbPool;
use newtypes::LogNumTenantApiKeysArgs;

pub(crate) struct LogNumTenantApiKeysTask {
    db_pool: DbPool,
}

impl LogNumTenantApiKeysTask {
    pub fn new(db_pool: DbPool) -> Self {
        Self { db_pool }
    }
}

#[async_trait]
impl ExecuteTask<LogNumTenantApiKeysArgs> for LogNumTenantApiKeysTask {
    async fn execute(&self, args: &LogNumTenantApiKeysArgs) -> FpResult<()> {
        let tenant_id = args.tenant_id.clone();
        let is_live = args.is_live;
        let cnt = self
            .db_pool
            .db_query(move |conn| -> Result<i64, DbError> {
                Tenant::get(conn, &tenant_id)?; // assert tenant exists

                let filters = ApiKeyListFilters {
                    tenant_id,
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
            args.tenant_id, args.is_live, cnt
        );
        tracing::info!(log);
        println!("{}", log);
        Ok(())
    }
}
