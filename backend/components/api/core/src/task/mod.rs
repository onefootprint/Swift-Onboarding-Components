use self::tasks::fire_webhook_task::FireWebhookTask;
use self::tasks::log_message_task::LogMessageTask;
use self::tasks::log_num_tenant_api_keys_task::LogNumTenantApiKeysTask;
use self::tasks::run_incode_stuck_workflow_task::RunIncodeStuckWorkflowTask;
use self::tasks::watchlist_check::watchlist_check_task::WatchlistCheckTask;
use crate::FpError;
use crate::State;
use async_trait::async_trait;
use db::models::task::Task;
use db::models::task_execution::TaskExecution;
use db::models::task_execution::TaskExecutionUpdate;
use db::DbError;
use db::DbPool;
use db::DbResult;
use newtypes::TaskExecutionId;
use newtypes::TaskId;
use newtypes::TaskKind;
use newtypes::TaskStatus;
use thiserror::Error;
use tracing::Instrument;

mod tasks;

#[derive(Debug, Error)]
pub enum TaskError {
    #[error("{0}")]
    Database(#[from] DbError),
    #[error("{0}")]
    ApiError(#[from] FpError),
    #[error("{0}")]
    IdologyError(#[from] idv::idology::error::Error),
    #[error("{0}")]
    IdvError(#[from] idv::Error),
    #[error("{0}")]
    WebhookError(#[from] webhooks::Error),
}

pub fn execute_webhook_tasks(state: State) {
    poll_and_execute_tasks_non_blocking(state, 10, Some(TaskKind::FireWebhook))
}

pub fn poll_and_execute_tasks_non_blocking(state: State, limit: u32, kind: Option<TaskKind>) {
    let fut = async move {
        let _ = poll_and_execute_tasks(&state, limit, kind)
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

pub async fn poll_and_execute_tasks(
    state: &State,
    limit: u32,
    kind: Option<TaskKind>,
) -> Result<Vec<Task>, DbError> {
    let tasks: Vec<(Task, TaskExecution)> = state
        .db_pool
        .db_transaction(move |conn| -> Result<Vec<_>, DbError> {
            let tasks = Task::poll(conn, limit, kind)?;
            Ok(tasks)
        })
        .await?;

    tracing::info!(tasks = format!("{:?}", tasks), "Executing polled tasks");
    let futs = tasks.iter().map(|(t, te)| async {
        tracing::info!(task_id=%t.id, "Executing task");
        let task_result = execute_task(t, state).await;
        let task_error_str = match &task_result {
            Ok(_) => {
                tracing::info!(task_id=%t.id, "Task completed successfully");
                None
            }
            Err(err) => {
                tracing::error!(?err, task_id=%t.id, num_attempts=t.num_attempts, "Task failed");
                Some(format!("{:?}", err))
            }
        };
        let task_new_status = task_result_to_status(t, task_result);
        let task_execution_update = TaskExecutionUpdate::new(task_new_status, task_error_str);
        update_task(
            &state.db_pool,
            t.id.clone(),
            task_new_status,
            &te.id,
            task_execution_update,
        )
        .await
    });

    futures::future::join_all(futs)
        .await
        .into_iter()
        .collect::<Result<Vec<Task>, DbError>>()
}

async fn execute_task(task: &Task, state: &State) -> Result<(), TaskError> {
    match &task.task_data {
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
        newtypes::TaskData::FireWebhook(args) => {
            FireWebhookTask::new(state.webhook_client.clone())
                .execute(args)
                .await
        }
        newtypes::TaskData::RunIncodeStuckWorkflow(args) => {
            RunIncodeStuckWorkflowTask::new(state.clone()).execute(args).await
        }
    }
}

fn task_result_to_status(task: &Task, task_result: Result<(), TaskError>) -> TaskStatus {
    match task_result {
        Ok(_) => TaskStatus::Completed,
        Err(_) => {
            if task.num_attempts >= task.task_data.kind().max_attempts() {
                TaskStatus::Failed
            } else {
                // if we havent exceeded our max number of attempts, then we set the task back to pending so
                // it will be re-polled and execution re-tried again in a future run
                TaskStatus::Pending
            }
        }
    }
}

async fn update_task(
    db_pool: &DbPool,
    task_id: TaskId,
    task_status: TaskStatus,
    task_execution_id: &TaskExecutionId,
    task_execution_update: TaskExecutionUpdate,
) -> DbResult<Task> {
    let te_id = task_execution_id.clone();
    db_pool
        .db_transaction(move |conn| -> DbResult<Task> {
            let updated_task =
                Task::update_running_task(conn, &task_id, task_status, &te_id, task_execution_update)?;
            Ok(updated_task)
        })
        .await
}

#[async_trait]
trait ExecuteTask<T> {
    async fn execute(&self, args: &T) -> Result<(), TaskError>;
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
            .db_pool
            .db_query(move |conn| -> Result<Vec<Task>, DbError> {
                Ok(vec![
                    Task::create(conn, Utc::now(), task_data("task1 yo"))?,
                    Task::create(conn, Utc::now(), task_data("task2 yo"))?,
                    Task::create(conn, Utc::now(), task_data("task3 yo"))?,
                ])
            })
            .await
            .unwrap();

        // Test
        let executed_tasks = poll_and_execute_tasks(state, 2, None).await.unwrap();
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
