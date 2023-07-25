use async_trait::async_trait;
use db::{models::task::Task, DbError, DbPool};
use newtypes::{TaskId, TaskKind, TaskStatus};
use thiserror::Error;

use crate::{errors::ApiError, State};

use self::tasks::{
    fire_webhook_task::FireWebhookTask, log_message_task::LogMessageTask,
    log_num_tenant_api_keys_task::LogNumTenantApiKeysTask, watchlist_check_task::WatchlistCheckTask,
};

mod tasks;
#[cfg(test)]
mod tests;

// constant for now, but can make this a property of task type too
#[allow(unused)]
const MAX_NUM_ATTEMPTS: i32 = 1; // since Task and our first use case (WatchlistCheck) are brand new, we want to manually react to every error so we aren't allowing automated retries yet

#[derive(Debug, Error)]
pub enum TaskError {
    #[error("{0}")]
    Database(#[from] DbError),
    #[error("{0}")]
    ApiError(#[from] ApiError),
    #[error("{0}")]
    IdologyError(#[from] idv::idology::error::Error),
    #[error("{0}")]
    IdvError(#[from] idv::Error),
    #[error("{0}")]
    WebhookError(#[from] webhooks::Error),
}

pub fn execute_webhook_tasks(state: State) {
    poll_and_execute_tasks_non_blocking(state, 10, TaskKind::FireWebhook)
}

pub fn poll_and_execute_tasks_non_blocking(state: State, limit: i64, kind: TaskKind) {
    tokio::spawn(async move {
        let _ = poll_and_execute_tasks(&state, limit, Some(kind))
            .await
            .map_err(|err| {
                tracing::error!(error=?err, kind=?kind, "poll_and_execute_tasks_non_blocking failed to execute 1 or more tasks");
            });
    });
}

pub async fn poll_and_execute_tasks(
    state: &State,
    limit: i64,
    kind: Option<TaskKind>,
) -> Result<Vec<Task>, DbError> {
    let tasks = state
        .db_pool
        .db_transaction(move |conn| -> Result<Vec<Task>, DbError> {
            let tasks = Task::poll(conn, limit, kind)?;
            Ok(tasks)
        })
        .await?;

    tracing::info!(tasks = format!("{:?}", tasks), "Executing polled tasks");
    let futs = tasks.iter().map(|t| async {
        tracing::info!(task_id=%t.id, "Executing task");
        let task_result = execute_task(t, state).await;
        match &task_result {
            Ok(_) => {
                tracing::info!(task_id=%t.id, "Task completed successfully");
            }
            Err(e) => {
                tracing::error!(err=%e, task_id=%t.id, num_attempts=t.num_attempts, "Task failed");
            }
        };
        let task_new_status = task_result_to_status(t, task_result);
        update_task(&state.db_pool, t.id.clone(), task_new_status).await
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
            WatchlistCheckTask::new(
                state.db_pool.clone(),
                task.id.clone(),
                state.enclave_client.clone(),
                state.vendor_clients.idology_pa.clone(),
                state.webhook_client.clone(),
                state.config.clone(),
            )
            .execute(args)
            .await
        }
        newtypes::TaskData::FireWebhook(args) => {
            FireWebhookTask::new(state.webhook_client.clone())
                .execute(args)
                .await
        }
    }
}

fn task_result_to_status(task: &Task, task_result: Result<(), TaskError>) -> TaskStatus {
    match task_result {
        Ok(_) => TaskStatus::Completed,
        Err(_) => {
            if task.num_attempts >= MAX_NUM_ATTEMPTS {
                TaskStatus::Failed
            } else {
                // if we havent exceeded our max number of attempts, then we set the task back to pending so it will be re-polled and execution re-tried again in a future run
                TaskStatus::Pending
            }
        }
    }
}

async fn update_task(db_pool: &DbPool, task_id: TaskId, task_status: TaskStatus) -> Result<Task, DbError> {
    db_pool
        .db_query(move |conn| {
            let updated_task = Task::update(conn, &task_id, task_status)?;
            Ok(updated_task)
        })
        .await?
}

#[allow(unused)]
async fn update_tasks(
    task_updates: Vec<(TaskId, TaskStatus)>,
    db_pool: &DbPool,
) -> Result<Vec<Task>, DbError> {
    // TODO: in future do a proper bulk update in 1 diesel query
    let updated_tasks = db_pool
        .db_transaction(move |conn| -> Result<Vec<Task>, DbError> {
            let updated_tasks: Result<Vec<Task>, DbError> = task_updates
                .iter()
                .map(|tu| {
                    let updated_task = Task::update(conn, &tu.0, tu.1)?;
                    Ok(updated_task)
                })
                .collect();
            updated_tasks
        })
        .await?;
    Ok(updated_tasks)
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
    use newtypes::{LogMessageTaskArgs, TaskData};

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
            .unwrap()
            .unwrap();

        // Test
        let executed_tasks = poll_and_execute_tasks(state, 2, None).await.unwrap();
        // TODO: would be nice to actually assert the tasks did what they were supposed to do. Some dumb ideas: have a task which writes a Task to PG with a
        // particular nonce as an arg and then confirm that was written. Or a task that writes to a tmp file and then we read and confirm
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

        // Teardown
        cleanup(&state.db_pool, tasks).await.unwrap();
    }

    async fn cleanup(db_pool: &DbPool, tasks: Vec<Task>) -> Result<(), DbError> {
        let _cnt = db_pool
            .db_query(move |conn| Task::_bulk_delete_for_tests(conn, tasks.iter().map(|t| &t.id).collect()))
            .await??;
        Ok(())
    }
}
