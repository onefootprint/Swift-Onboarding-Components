use anyhow::anyhow;
use anyhow::Result;
use api_core::config::Config;
use api_core::State;
use chrono::DateTime;
use chrono::Duration;
use chrono::Utc;
use clap::Parser;
use db::models::task::Task;
use db::models::task::TaskCreateArgs;
use db::models::watchlist_check::WatchlistCheck;
use newtypes::output::Csv;
use newtypes::TaskData;
use newtypes::TaskId;
use newtypes::TenantId;
use newtypes::WatchlistCheckArgs;
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
            .db_query(move |conn| {
                let overdue_svs = WatchlistCheck::get_overdue_scoped_vaults(conn, tenant_id, limit)?;
                let cnt = overdue_svs.len();
                let task_args: Vec<TaskCreateArgs> = overdue_svs
                    .into_iter()
                    .zip(distribute_timestamps(cnt, Utc::now(), Duration::hours(2)))
                    .map(|(sv, dt)| TaskCreateArgs {
                        scheduled_for: dt,
                        task_data: TaskData::WatchlistCheck(WatchlistCheckArgs { scoped_vault_id: sv }),
                    })
                    .collect();
                Task::bulk_create(conn, task_args)
            })
            .await
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

fn distribute_timestamps(
    length: usize,
    start: DateTime<Utc>,
    duration: Duration,
) -> impl Iterator<Item = DateTime<Utc>> {
    let interval = if length > 1 {
        duration / (length as i32 - 1)
    } else {
        duration
    };
    (0..length).map(move |idx| {
        if idx == 0 {
            start
        } else {
            start + interval * (idx as i32)
        }
    })
}

#[cfg(test)]
mod tests {
    use super::distribute_timestamps;
    use chrono::DateTime;
    use chrono::Duration;
    use chrono::Utc;
    use test_case::test_case;

    fn dt(s: &str) -> DateTime<Utc> {
        DateTime::parse_from_rfc3339(s).unwrap().with_timezone(&Utc)
    }

    #[test_case(0, dt("2020-04-04T17:00:00+00:00"), Duration::hours(1) => Vec::<DateTime<Utc>>::new())]
    #[test_case(1, dt("2020-04-04T17:00:00+00:00"), Duration::hours(1) => vec![dt("2020-04-04T17:00:00Z")])]
    #[test_case(2, dt("2020-04-04T17:00:00+00:00"), Duration::hours(1) => vec![dt("2020-04-04T17:00:00Z"), dt("2020-04-04T18:00:00Z")])]
    #[test_case(4, dt("2020-04-04T17:00:00+00:00"), Duration::hours(1) => vec![dt("2020-04-04T17:00:00Z"), dt("2020-04-04T17:20:00Z"), dt("2020-04-04T17:40:00Z"), dt("2020-04-04T18:00:00Z")])]
    fn test_distribute_timestamps(
        len: usize,
        start: DateTime<Utc>,
        duration: Duration,
    ) -> Vec<DateTime<Utc>> {
        distribute_timestamps(len, start, duration).collect::<Vec<_>>()
    }
}
