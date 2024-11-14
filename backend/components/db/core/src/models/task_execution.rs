use crate::PgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::task_execution;
use diesel::prelude::*;
use newtypes::TaskExecutionId;
use newtypes::TaskId;
use newtypes::TaskStatus;

#[derive(Debug, Clone, Queryable, Identifiable, QueryableByName)]
#[diesel(table_name = task_execution)]
pub struct TaskExecution {
    pub id: TaskExecutionId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub task_id: TaskId,
    pub attempt_num: i32,
    pub error: Option<String>,
    pub new_status: Option<TaskStatus>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = task_execution)]
pub struct NewTaskExecution {
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub task_id: TaskId,
    pub attempt_num: i32,
    pub error: Option<String>,
    pub new_status: Option<TaskStatus>,
}

pub struct TaskExecutionCreateArgs {
    pub task_id: TaskId,
    pub attempt_num: i32,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = task_execution)]
pub struct TaskExecutionUpdate {
    pub completed_at: DateTime<Utc>,
    pub new_status: TaskStatus,
    pub error: Option<Option<String>>,
}

impl TaskExecutionUpdate {
    pub fn new(new_status: TaskStatus, error: Option<String>) -> TaskExecutionUpdate {
        Self {
            completed_at: Utc::now(),
            new_status,
            error: error.map(Some),
        }
    }
}

impl TaskExecution {
    #[tracing::instrument("TaskExecution::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut PgConn,
        args: Vec<TaskExecutionCreateArgs>,
        now: DateTime<Utc>,
    ) -> FpResult<Vec<Self>> {
        let new_rows: Vec<NewTaskExecution> = args
            .into_iter()
            .map(|a| NewTaskExecution {
                created_at: now,
                completed_at: None,
                task_id: a.task_id,
                attempt_num: a.attempt_num,
                error: None,
                new_status: None,
            })
            .collect();
        let res = diesel::insert_into(task_execution::table)
            .values(new_rows)
            .get_results::<Self>(conn)?;
        Ok(res)
    }

    #[tracing::instrument("TaskExecution::update", skip_all)]
    pub fn update(conn: &mut PgConn, id: &TaskExecutionId, update: TaskExecutionUpdate) -> FpResult<Self> {
        let result = diesel::update(task_execution::table)
            .filter(task_execution::id.eq(id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }
}
