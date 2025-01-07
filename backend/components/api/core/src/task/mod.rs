use self::tasks::fire_webhook_task::FireWebhookTask;
use self::tasks::log_message_task::LogMessageTask;
use self::tasks::log_num_tenant_api_keys_task::LogNumTenantApiKeysTask;
use self::tasks::run_incode_stuck_workflow_task::RunIncodeStuckWorkflowTask;
use self::tasks::watchlist_check::watchlist_check_task::WatchlistCheckTask;
use crate::State;
use api_errors::FpResult;
use async_trait::async_trait;
use db::models::task::Task;
use db::models::task::TaskPollArgs;
use db::models::task_execution::TaskExecutionUpdate;
use newtypes::TaskKind;
use newtypes::TaskStatus;
use tasks::generate_invoice::GenerateInvoiceTask;
use tracing::Instrument;

mod tasks;

pub fn execute_webhook_tasks(state: State) {
    let args = TaskPollArgs::Kind {
        limit: 10,
        kind: TaskKind::FireWebhook,
    };
    poll_and_execute_tasks_non_blocking(state, args);
}

pub fn poll_and_execute_tasks_non_blocking(state: State, args: TaskPollArgs) {
    let kind = args.kind();
    let fut = async move {
        let _ = poll_and_execute_tasks(&state, args)
            .await
            .map_err(|err| {
                tracing::error!(?err, kind=?kind, "poll_and_execute_tasks_non_blocking failed to execute 1 or more tasks");
            });
    };

    if cfg!(test) {
        tokio::task::block_in_place(move || {
            futures::executor::block_on(fut);
        });
    } else {
        tokio::spawn(fut.in_current_span());
    }
}

pub async fn poll_and_execute_tasks(state: &State, args: TaskPollArgs) -> FpResult<Vec<Task>> {
    let tasks = state
        .db_transaction(move |conn| match args {
            args @ TaskPollArgs::Limit { .. } | args @ TaskPollArgs::Kind { .. } => {
                Task::poll(conn, args.limit(), args.kind())
            }
            TaskPollArgs::Single { id } => Task::poll_single(conn, id),
        })
        .await?;

    tracing::info!(tasks = format!("{:?}", tasks), "Executing polled tasks");
    let futs = tasks.into_iter().map(|(t, te)| async move {
        let task_id = t.id.clone();
        tracing::info!(%task_id, "Executing task");
        let num_attempts = t.num_attempts;
        let task_kind = TaskKind::from(&t.task_data);

        let task_result = execute_task(t, state).await;

        let (new_task_status, task_error_str) = match task_result {
            Ok(_) => {
                tracing::info!(%task_id, "Task completed successfully");
                (TaskStatus::Completed, None)
            }
            Err(err) => {
                let task_status = if num_attempts >= task_kind.max_attempts() {
                    TaskStatus::Failed
                } else {
                    // if we havent exceeded our max number of attempts, then we set the task back to pending
                    // so it will be re-polled and execution re-tried again in a future
                    // run
                    TaskStatus::Pending
                };
                tracing::error!(?err, %task_id, %num_attempts, "Task failed");
                (task_status, Some(format!("{:?}", err)))
            }
        };

        let task_execution_update = TaskExecutionUpdate::new(new_task_status, task_error_str);
        let te_id = te.id.clone();
        state
            .db_transaction(move |conn| {
                Task::update_running_task(conn, &task_id, new_task_status, &te_id, task_execution_update)
            })
            .await
    });

    futures::future::join_all(futs)
        .await
        .into_iter()
        .collect::<FpResult<Vec<_>>>()
}

async fn execute_task(task: Task, state: &State) -> FpResult<()> {
    match task.task_data {
        newtypes::TaskData::LogMessage(args) => LogMessageTask {}.execute(args).await,
        newtypes::TaskData::LogNumTenantApiKeys(args) => {
            LogNumTenantApiKeysTask::new(state.db_pool.clone())
                .execute(args)
                .await
        }
        newtypes::TaskData::WatchlistCheck(args) => {
            WatchlistCheckTask::new(state.clone(), task.id.clone())
                .execute(args)
                .await
        }
        newtypes::TaskData::FireWebhook(args) => FireWebhookTask::new(state.clone()).execute(args).await,
        newtypes::TaskData::RunIncodeStuckWorkflow(args) => {
            RunIncodeStuckWorkflowTask::new(state.clone()).execute(args).await
        }
        newtypes::TaskData::GenerateInvoice(args) => {
            GenerateInvoiceTask::new(state.clone()).execute(args).await
        }
    }
}

#[async_trait]
trait ExecuteTask<T> {
    async fn execute(self, args: T) -> FpResult<()>;
}

#[cfg(test)]
mod task_tests {

    use super::*;
    use chrono::Utc;
    use db::test_helpers::have_same_elements;
    use db::tests::test_db_pool::TestDbPool;
    use macros::test_state;
    use newtypes::LogMessageTaskArgs;
    use newtypes::TaskData;

    fn task_data(message: &str) -> TaskData {
        TaskData::LogMessage(LogMessageTaskArgs {
            message: message.to_owned(),
        })
    }

    #[test_state]
    async fn basic_end_to_end(state: &mut State) {
        // Setup
        let tasks = state
            .db_query(move |conn| {
                Ok(vec![
                    Task::create(conn, Utc::now(), task_data("task1 yo"))?,
                    Task::create(conn, Utc::now(), task_data("task2 yo"))?,
                    Task::create(conn, Utc::now(), task_data("task3 yo"))?,
                ])
            })
            .await
            .unwrap();

        // Test
        let args = TaskPollArgs::Limit { limit: 2 };
        let executed_tasks = poll_and_execute_tasks(state, args).await.unwrap();
        // TODO: would be nice to actually assert the tasks did what they were supposed to do. Some dumb
        // ideas: have a task which writes a Task to PG with a particular nonce as an arg and then
        // confirm that was written. Or a task that writes to a tmp file and then we read and confirm
        assert!(have_same_elements(
            vec![
                (&tasks[0].id, TaskStatus::Completed, 1),
                (&tasks[1].id, TaskStatus::Completed, 1),
            ],
            executed_tasks
                .iter()
                .map(|t| (&t.id, t.status, t.num_attempts))
                .collect()
        ));
    }
}
