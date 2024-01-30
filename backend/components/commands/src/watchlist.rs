use anyhow::{anyhow, Result};
use api_core::{config::Config, State};
use chrono::Utc;
use clap::Parser;
use db::{
    models::{
        task::{Task, TaskCreateArgs},
        watchlist_check::WatchlistCheck,
    },
    DbError,
};
use newtypes::{output::Csv, TaskData, TaskId, TenantId, WatchlistCheckArgs};
use std::str::FromStr;
use tracing::info;

#[derive(Parser, Debug)]
pub struct CreateOverdueWatchlistCheckTasks {
    #[arg(long)]
    pub limit: Option<i64>,
}

const LEGACY_NON_ENHANCED_AML_TENANT_ID: &str = "org_PtnIJT4VR35BS9xy0wITgF";

impl CreateOverdueWatchlistCheckTasks {
    #[tracing::instrument("CreateOverdueWatchlistCheckTasks::run", skip_all)]
    pub async fn run(self, _config: Config, state: State) -> Result<()> {
        let limit = self.limit.unwrap_or(0);

        info!(limit, "creating overdue watchlist check tasks...",);

        #[allow(clippy::unwrap_used)]
        let tenant_id = TenantId::from_str(LEGACY_NON_ENHANCED_AML_TENANT_ID).unwrap(); // Infallible

        let new_tasks = state
            .db_pool
            .db_query(move |conn| -> Result<_, DbError> {
                let overdue_svs = WatchlistCheck::get_overdue_scoped_vaults(conn, tenant_id, limit)?;
                let now = Utc::now();
                let task_args: Vec<TaskCreateArgs> = overdue_svs
                    .into_iter()
                    .map(|sv| TaskCreateArgs {
                        scheduled_for: now,
                        task_data: TaskData::WatchlistCheck(WatchlistCheckArgs { scoped_vault_id: sv }),
                    })
                    .collect();
                Task::bulk_create(conn, task_args)
            })
            .await
            .map_err(|err| anyhow!("{}", err))?
            .map_err(|err| anyhow!("{}", err))?;

        let created_task_ids: Vec<TaskId> = new_tasks.into_iter().map(|t| t.id).collect();
        info!(
            num_created_tasks = created_task_ids.len(),
            created_task_ids = %Csv::from(created_task_ids),
            "finished creating overdue watchlist check tasks"
        );

        Ok(())
    }
}
