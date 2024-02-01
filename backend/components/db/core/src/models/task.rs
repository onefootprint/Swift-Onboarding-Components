use std::collections::HashMap;

use crate::{DbError, DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::task;
use diesel::{
    prelude::*,
    sql_query,
    sql_types::{BigInt, Text, Timestamptz},
};
use newtypes::{Locked, TaskData, TaskExecutionId, TaskId, TaskKind, TaskStatus};

use super::task_execution::{TaskExecution, TaskExecutionCreateArgs, TaskExecutionUpdate};

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
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = task)]
pub struct NewTask {
    pub created_at: DateTime<Utc>,
    pub scheduled_for: DateTime<Utc>,
    pub task_data: TaskData,
    pub status: TaskStatus,
    pub num_attempts: i32,
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
    pub fn create(
        conn: &mut PgConn,
        scheduled_for: DateTime<Utc>,
        task_data: TaskData,
    ) -> Result<Task, DbError> {
        let new_task = NewTask {
            created_at: Utc::now(),
            scheduled_for,
            task_data,
            status: TaskStatus::Pending,
            num_attempts: 0,
        };
        let result = diesel::insert_into(task::table)
            .values(new_task)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("Task::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut PgConn, args: Vec<TaskCreateArgs>) -> DbResult<Vec<Self>> {
        let new_tasks: Vec<NewTask> = args
            .into_iter()
            .map(|a| NewTask {
                created_at: Utc::now(),
                scheduled_for: a.scheduled_for,
                task_data: a.task_data,
                status: TaskStatus::Pending,
                num_attempts: 0,
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
    ) -> DbResult<Vec<(Task, TaskExecution)>> {
        // TODO: cannot for the life of me get this to compile in diesel
        let tasks = sql_query(format!(
            "
            UPDATE task
            SET status = $1, num_attempts = num_attempts + 1
            WHERE id IN (
                SELECT id FROM task
                WHERE status = $2 AND scheduled_for < $3{}
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
        .bind::<Timestamptz, _>(Utc::now())
        .bind::<BigInt, _>(i64::from(limit))
        .get_results::<Task>(conn.conn())?;

        let task_execution_args: Vec<TaskExecutionCreateArgs> = tasks
            .iter()
            .map(|t| TaskExecutionCreateArgs {
                task_id: t.id.clone(),
                attempt_num: t.num_attempts,
            })
            .collect();
        let task_executions = TaskExecution::bulk_create(conn.conn(), task_execution_args)?;
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
    pub fn update(
        conn: &mut TxnPgConn,
        id: &TaskId,
        status: TaskStatus,
        task_execution_id: &TaskExecutionId,
        task_execution_update: TaskExecutionUpdate,
    ) -> DbResult<Self> {
        let _updated_task_execution =
            TaskExecution::update(conn.conn(), task_execution_id, task_execution_update)?;

        let task_update = TaskUpdate { status };
        let result = diesel::update(task::table)
            .filter(task::id.eq(id))
            .set(task_update)
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("Task::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, task_id: &TaskId) -> DbResult<Locked<Self>> {
        let result = task::table
            .filter(task::id.eq(task_id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    // Currently only used for Tests! pretend there is #[cfg(test)] here!!
    #[tracing::instrument("Task::_bulk_delete_for_tests", skip_all)]
    pub fn _bulk_delete_for_tests(conn: &mut PgConn, ids: Vec<&TaskId>) -> DbResult<usize> {
        let cnt = diesel::delete(task::table.filter(task::id.eq_any(ids))).execute(conn)?;
        Ok(cnt)
    }

    #[cfg(test)]
    pub fn create_for_test(conn: &mut PgConn, new_task: NewTask) -> DbResult<Self> {
        let res = diesel::insert_into(task::table)
            .values(new_task)
            .get_result(conn)?;
        Ok(res)
    }

    #[cfg(test)]
    #[tracing::instrument("Task::update", skip_all)]
    pub fn _update_for_test(conn: &mut TxnPgConn, id: &TaskId, status: TaskStatus) -> DbResult<Self> {
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
    use crate::{
        test_helpers::{assert_have_same_elements, have_same_elements},
        tests::prelude::*,
    };
    use macros::db_test;
    use newtypes::{LogMessageTaskArgs, LogNumTenantApiKeysArgs};
    use std::str::FromStr;

    fn task_data() -> TaskData {
        TaskData::LogMessage(LogMessageTaskArgs {
            message: "yo".to_owned(),
        })
    }

    #[db_test]
    fn create_and_poll(conn: &mut TestPgConn) {
        let task1 = Task::create(conn, Utc::now(), task_data()).unwrap();
        let task2 = Task::create(conn, Utc::now(), task_data()).unwrap();
        let _task3 = Task::create(conn, Utc::now(), task_data()).unwrap();
        let _task4 = Task::create(conn, Utc::now(), task_data()).unwrap();

        let tasks = Task::poll(conn, 2, None).unwrap();
        // The oldest 2 scheduled tasks and returned + their status has changed to Running and their num_attempts is incremented
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
    }

    #[db_test]
    fn only_pending_tasks_are_retrieved(conn: &mut TestPgConn) {
        let task1 = Task::create(conn, Utc::now(), task_data()).unwrap();
        Task::_update_for_test(conn, &task1.id, TaskStatus::Running);
        let task2 = Task::create(conn, Utc::now(), task_data()).unwrap();
        Task::_update_for_test(conn, &task2.id, TaskStatus::Completed);
        let task3 = Task::create(conn, Utc::now(), task_data()).unwrap();
        Task::_update_for_test(conn, &task3.id, TaskStatus::Failed);
        let task4 = Task::create(conn, Utc::now(), task_data()).unwrap();

        let tasks = Task::poll(conn, 4, None).unwrap();
        assert_eq!(1, tasks.len());
        assert_eq!(tasks[0].0.id, task4.id);
    }

    #[db_test]
    fn filter_to_kind(conn: &mut TestPgConn) {
        let task1 = Task::create(conn, Utc::now(), task_data()).unwrap();
        let _task2 = Task::create(
            conn,
            Utc::now(),
            TaskData::LogNumTenantApiKeys(LogNumTenantApiKeysArgs {
                tenant_id: newtypes::TenantId::from_str("t123").unwrap(),
                is_live: true,
            }),
        )
        .unwrap();
        let task3 = Task::create(conn, Utc::now(), task_data()).unwrap();
        let _task4 = Task::create(
            conn,
            Utc::now(),
            TaskData::LogNumTenantApiKeys(LogNumTenantApiKeysArgs {
                tenant_id: newtypes::TenantId::from_str("t456").unwrap(),
                is_live: true,
            }),
        )
        .unwrap();

        let tasks = Task::poll(conn, 2, Some(TaskKind::LogMessage)).unwrap();
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
    }
}
