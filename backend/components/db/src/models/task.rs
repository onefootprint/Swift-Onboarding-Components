use chrono::{DateTime, Utc};
use diesel::{
    prelude::*,
    sql_query,
    sql_types::{BigInt, Text, Timestamptz},
};
use newtypes::{TaskData, TaskId, TaskStatus};
use serde::{Deserialize, Serialize};

use crate::{schema::task, DbError, DbResult, PgConn, TxnPgConn};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName)]
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

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = task)]
struct NewTask {
    pub created_at: DateTime<Utc>,
    pub scheduled_for: DateTime<Utc>,
    pub task_data: TaskData,
    pub status: TaskStatus,
    pub num_attempts: i32,
}

#[derive(AsChangeset)]
#[diesel(table_name = task)]
pub struct TaskUpdate {
    status: TaskStatus,
}

impl Task {
    #[tracing::instrument(skip_all)]
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

    #[tracing::instrument(skip_all)]
    pub fn poll(conn: &mut TxnPgConn, limit: i64) -> DbResult<Vec<Self>> {
        // TODO: cannot for the life of me get this to compile in diesel
        let results = sql_query(
            "
            UPDATE task
            SET status = $1, num_attempts = num_attempts + 1
            WHERE id IN (
                SELECT id FROM task
                WHERE status = $2 AND scheduled_for < $3
                ORDER BY scheduled_for ASC
                FOR UPDATE SKIP LOCKED
                LIMIT $4
            )
            RETURNING *;
        ",
        )
        .bind::<Text, _>(TaskStatus::Running)
        .bind::<Text, _>(TaskStatus::Pending)
        .bind::<Timestamptz, _>(Utc::now())
        .bind::<BigInt, _>(limit)
        .get_results::<Task>(conn.conn())?;

        Ok(results)
    }

    #[tracing::instrument(skip_all)]
    pub fn update(conn: &mut PgConn, id: &TaskId, status: TaskStatus) -> DbResult<Self> {
        let task_update = TaskUpdate { status };
        let result = diesel::update(task::table)
            .filter(task::id.eq(id))
            .set(task_update)
            .get_result(conn)?;
        Ok(result)
    }

    // Currently only used for Tests! pretend there is #[cfg(test)] here!!
    pub fn _bulk_delete_for_tests(conn: &mut PgConn, ids: Vec<&TaskId>) -> DbResult<usize> {
        let cnt = diesel::delete(task::table.filter(task::id.eq_any(ids))).execute(conn)?;
        Ok(cnt)
    }
}

#[cfg(test)]
#[allow(unused_must_use)]
mod tests {
    use super::*;
    use crate::test_helpers::have_same_elements;
    use crate::tests::prelude::*;
    use macros::db_test;
    use newtypes::LogMessageTaskArgs;

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

        let tasks = Task::poll(conn, 2).unwrap();
        // The oldest 2 scheduled tasks and returned + their status has changed to Running and their num_attempts is incremented
        assert!(have_same_elements(
            vec![
                (&task1.id, TaskStatus::Running, 1),
                (&task2.id, TaskStatus::Running, 1),
            ],
            tasks.iter().map(|t| (&t.id, t.status, t.num_attempts)).collect(),
        ));
    }

    #[db_test]
    fn only_pending_tasks_are_retrieved(conn: &mut TestPgConn) {
        let task1 = Task::create(conn, Utc::now(), task_data()).unwrap();
        Task::update(conn, &task1.id, TaskStatus::Running);
        let task2 = Task::create(conn, Utc::now(), task_data()).unwrap();
        Task::update(conn, &task2.id, TaskStatus::Completed);
        let task3 = Task::create(conn, Utc::now(), task_data()).unwrap();
        Task::update(conn, &task3.id, TaskStatus::Failed);
        let task4 = Task::create(conn, Utc::now(), task_data()).unwrap();

        let tasks = Task::poll(conn, 4).unwrap();
        assert_eq!(1, tasks.len());
        assert_eq!(tasks[0].id, task4.id);
    }
}
