use super::task_execution::TaskExecution;
use super::task_execution::TaskExecutionCreateArgs;
use super::task_execution::TaskExecutionUpdate;
use crate::DbError;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::task;
use diesel::prelude::*;
use diesel::sql_query;
use diesel::sql_types::BigInt;
use diesel::sql_types::Text;
use diesel::sql_types::Timestamptz;
use newtypes::Locked;
use newtypes::TaskData;
use newtypes::TaskExecutionId;
use newtypes::TaskId;
use newtypes::TaskKind;
use newtypes::TaskStatus;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Identifiable, QueryableByName)]
#[diesel(table_name = task)]
pub struct Task {
    pub id: TaskId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub scheduled_for: DateTime<Utc>,
    pub task_data: TaskData,
    pub status: TaskStatus,
    pub num_attempts: i32,
    pub max_lease_duration_s: Option<i32>,
    pub last_leased_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = task)]
pub struct NewTask {
    pub created_at: DateTime<Utc>,
    pub scheduled_for: DateTime<Utc>,
    pub task_data: TaskData,
    pub status: TaskStatus,
    pub num_attempts: i32,
    pub max_lease_duration_s: Option<i32>,
    pub last_leased_at: Option<DateTime<Utc>>,
}

pub struct TaskCreateArgs {
    pub scheduled_for: DateTime<Utc>,
    pub task_data: TaskData,
}

#[derive(AsChangeset)]
#[diesel(table_name = task)]
pub struct TaskUpdate {
    status: TaskStatus,
}

impl Task {
    #[tracing::instrument("Task::create", skip_all)]
    pub fn create<T: Into<TaskData>>(
        conn: &mut PgConn,
        scheduled_for: DateTime<Utc>,
        task_data: T,
    ) -> FpResult<Task> {
        let task_data = task_data.into();
        let task_kind = TaskKind::from(&task_data);
        let new_task = NewTask {
            created_at: Utc::now(),
            scheduled_for,
            task_data,
            status: TaskStatus::Pending,
            num_attempts: 0,
            max_lease_duration_s: Some(task_kind.max_lease_duration().num_seconds() as i32),
            last_leased_at: None,
        };
        let result = diesel::insert_into(task::table)
            .values(new_task)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("Task::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut PgConn, args: Vec<TaskCreateArgs>) -> FpResult<Vec<Self>> {
        let new_tasks: Vec<NewTask> = args
            .into_iter()
            .map(|a| NewTask {
                created_at: Utc::now(),
                scheduled_for: a.scheduled_for,
                task_data: a.task_data.clone(),
                status: TaskStatus::Pending,
                num_attempts: 0,
                max_lease_duration_s: Some(
                    TaskKind::from(a.task_data).max_lease_duration().num_seconds() as i32
                ),
                last_leased_at: None,
            })
            .collect();
        let res = diesel::insert_into(task::table)
            .values(new_tasks)
            .get_results::<Self>(conn)?;
        Ok(res)
    }

    #[tracing::instrument("Task::poll", skip_all)]
    pub fn poll(
        conn: &mut TxnPgConn,
        limit: u32,
        kind: Option<TaskKind>,
    ) -> FpResult<Vec<(Task, TaskExecution)>> {
        let now = Utc::now();
        // TODO: cannot for the life of me get this to compile in diesel
        let tasks = sql_query(format!(
            "
            UPDATE task
            SET status = $1, num_attempts = num_attempts + 1, last_leased_at = $3
            WHERE id IN (
                SELECT id FROM task
                WHERE
                    (status = $2 AND scheduled_for < $3{})
                    or (status = $1 AND now() > last_leased_at + max_lease_duration_s * interval '1 second')
                ORDER BY scheduled_for ASC
                FOR UPDATE SKIP LOCKED
                LIMIT $4
            )
            RETURNING *;
        ",
            kind.map(|k| format!(" AND task_data->>'kind' = '{}'", k))
                .unwrap_or("".to_string()),
        ))
        .bind::<Text, _>(TaskStatus::Running)
        .bind::<Text, _>(TaskStatus::Pending)
        .bind::<Timestamptz, _>(now)
        .bind::<BigInt, _>(i64::from(limit))
        .get_results::<Task>(conn.conn())?;

        let task_execution_args: Vec<TaskExecutionCreateArgs> = tasks
            .iter()
            .map(|t| TaskExecutionCreateArgs {
                task_id: t.id.clone(),
                attempt_num: t.num_attempts,
            })
            .collect();
        let task_executions = TaskExecution::bulk_create(conn.conn(), task_execution_args, now)?;
        let task_id_to_task_execution: HashMap<TaskId, TaskExecution> = task_executions
            .into_iter()
            .map(|te| (te.task_id.clone(), te))
            .collect();
        let results = tasks
            .into_iter()
            .map(|t| {
                task_id_to_task_execution
                    .get(&t.id)
                    .cloned()
                    .ok_or(DbError::RelatedObjectNotFound)
                    .map(|te| (t, te))
            })
            .collect::<Result<Vec<_>, _>>()?;

        Ok(results)
    }

    #[tracing::instrument("Task::update", skip_all)]
    pub fn update_running_task(
        conn: &mut TxnPgConn,
        id: &TaskId,
        status: TaskStatus,
        task_execution_id: &TaskExecutionId,
        task_execution_update: TaskExecutionUpdate,
    ) -> FpResult<Self> {
        TaskExecution::update(conn.conn(), task_execution_id, task_execution_update)?;
        let task_update = TaskUpdate { status };
        let result = diesel::update(task::table)
            .filter(task::id.eq(id))
            .set(task_update)
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("Task::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, task_id: &TaskId) -> FpResult<Locked<Self>> {
        let result = task::table
            .filter(task::id.eq(task_id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    // Currently only used for Tests! pretend there is #[cfg(test)] here!!
    #[tracing::instrument("Task::_bulk_delete_for_tests", skip_all)]
    pub fn _bulk_delete_for_tests(conn: &mut PgConn, ids: Vec<&TaskId>) -> FpResult<usize> {
        let cnt = diesel::delete(task::table.filter(task::id.eq_any(ids))).execute(conn)?;
        Ok(cnt)
    }

    #[cfg(test)]
    pub fn create_for_test(conn: &mut PgConn, new_task: NewTask) -> FpResult<Self> {
        let res = diesel::insert_into(task::table)
            .values(new_task)
            .get_result(conn)?;
        Ok(res)
    }

    #[cfg(test)]
    #[tracing::instrument("Task::update", skip_all)]
    pub fn _update_for_test(conn: &mut TxnPgConn, id: &TaskId, status: TaskStatus) -> FpResult<Self> {
        // only updates `task`, not `task_execution`
        let task_update = TaskUpdate { status };
        let result = diesel::update(task::table)
            .filter(task::id.eq(id))
            .set(task_update)
            .get_result(conn.conn())?;
        Ok(result)
    }
}

#[cfg(test)]
#[allow(unused_must_use)]
mod tests {
    use super::*;
    use crate::test_helpers::assert_have_same_elements;
    use crate::test_helpers::have_same_elements;
    use crate::tests::test_db_pool::TestDbPool;
    use macros::test_db_pool;
    use newtypes::LogMessageTaskArgs;
    use newtypes::LogNumTenantApiKeysArgs;
    use std::str::FromStr;

    fn task_data() -> TaskData {
        TaskData::LogMessage(LogMessageTaskArgs {
            message: "yo".to_owned(),
        })
    }

    #[test_db_pool]
    async fn create_and_poll(db_pool: TestDbPool) {
        db_pool
            .db_transaction(|conn| -> FpResult<()> {
                let task1 = Task::create(conn, Utc::now(), task_data())?;
                let task2 = Task::create(conn, Utc::now(), task_data())?;
                let _task3 = Task::create(conn, Utc::now(), task_data())?;
                let _task4 = Task::create(conn, Utc::now(), task_data())?;

                let tasks = Task::poll(conn, 2, None)?;
                // The oldest 2 scheduled tasks and returned + their status has changed to Running and their
                // num_attempts is incremented
                assert!(have_same_elements(
                    vec![
                        (&task1.id, TaskStatus::Running, 1, &task1.id, 1),
                        (&task2.id, TaskStatus::Running, 1, &task2.id, 1),
                    ],
                    tasks
                        .iter()
                        .map(|(t, te)| (&t.id, t.status, t.num_attempts, &te.task_id, te.attempt_num))
                        .collect(),
                ));
                Ok(())
            })
            .await
            .unwrap();
    }

    #[test_db_pool]
    async fn only_pending_tasks_are_retrieved(db_pool: TestDbPool) {
        db_pool
            .db_transaction(|conn| -> FpResult<()> {
                let task1 = Task::create(conn, Utc::now(), task_data())?;
                Task::_update_for_test(conn, &task1.id, TaskStatus::Running);
                let task2 = Task::create(conn, Utc::now(), task_data())?;
                Task::_update_for_test(conn, &task2.id, TaskStatus::Completed);
                let task3 = Task::create(conn, Utc::now(), task_data())?;
                Task::_update_for_test(conn, &task3.id, TaskStatus::Failed);
                let task4 = Task::create(conn, Utc::now(), task_data())?;

                let tasks = Task::poll(conn, 4, None).unwrap();

                assert_eq!(1, tasks.len());
                assert_eq!(tasks[0].0.id, task4.id);
                Ok(())
            })
            .await
            .unwrap();
    }

    #[test_db_pool]
    async fn filter_to_kind(db_pool: TestDbPool) {
        db_pool
            .db_transaction(|conn| -> FpResult<()> {
                let task1 = Task::create(conn, Utc::now(), task_data())?;
                let _task2 = Task::create(
                    conn,
                    Utc::now(),
                    TaskData::LogNumTenantApiKeys(LogNumTenantApiKeysArgs {
                        tenant_id: newtypes::TenantId::from_str("t123").unwrap(),
                        is_live: true,
                    }),
                )?;
                let task3 = Task::create(conn, Utc::now(), task_data())?;
                let _task4 = Task::create(
                    conn,
                    Utc::now(),
                    TaskData::LogNumTenantApiKeys(LogNumTenantApiKeysArgs {
                        tenant_id: newtypes::TenantId::from_str("t456").unwrap(),
                        is_live: true,
                    }),
                )?;

                let tasks = Task::poll(conn, 2, Some(TaskKind::LogMessage))?;
                assert_have_same_elements(
                    vec![
                        (&task1.id, TaskStatus::Running, 1),
                        (&task3.id, TaskStatus::Running, 1),
                    ],
                    tasks
                        .iter()
                        .map(|(t, _)| (&t.id, t.status, t.num_attempts))
                        .collect(),
                );
                Ok(())
            })
            .await
            .unwrap();
    }

    #[test_db_pool]
    async fn poll_over_leased(db_pool: TestDbPool) {
        let tasks = db_pool
            .db_transaction(move |conn| {
                let task1 = Task::create(conn, Utc::now(), task_data())?;
                let task2 = Task::create(conn, Utc::now(), task_data())?;

                let tasks = Task::poll(conn, 2, None)?;
                assert!(have_same_elements(
                    vec![
                        (&task1.id, TaskStatus::Running, 1, &task1.id, 1),
                        (&task2.id, TaskStatus::Running, 1, &task2.id, 1),
                    ],
                    tasks
                        .iter()
                        .map(|(t, te)| (&t.id, t.status, t.num_attempts, &te.task_id, te.attempt_num))
                        .collect(),
                ));

                assert!(Task::poll(conn, 2, None).unwrap().is_empty());
                Ok(tasks)
            })
            .await
            .unwrap();

        std::thread::sleep(std::time::Duration::from_secs(3));
        db_pool
            .db_transaction(move |conn| {
                // tasks now past their max lease duration and should be polled again, num_attempts
                // incremented, and new task_execution's written
                let repolled_tasks = Task::poll(conn, 2, None)?;
                assert!(have_same_elements(
                    vec![
                        (&tasks[0].0.id, TaskStatus::Running, 2, &tasks[0].0.id, 2),
                        (&tasks[1].0.id, TaskStatus::Running, 2, &tasks[1].0.id, 2),
                    ],
                    repolled_tasks
                        .iter()
                        .map(|(t, te)| (&t.id, t.status, t.num_attempts, &te.task_id, te.attempt_num))
                        .collect(),
                ));
                assert_ne!(repolled_tasks[0].1.id, tasks[0].1.id);
                assert_ne!(repolled_tasks[1].1.id, tasks[1].1.id);

                assert!(Task::poll(conn, 2, None).unwrap().is_empty());
                Ok(())
            })
            .await
            .unwrap();
    }
}
