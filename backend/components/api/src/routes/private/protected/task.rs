use crate::auth::protected_custodian::ProtectedCustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::{task, State};

use chrono::Utc;
use db::models::task::Task;
use db::DbError;
use newtypes::{TaskData, TaskId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct ExecuteTasksRequest {
    pub num_tasks: i64,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ExecuteTasksResponse {
    pub num_executed_tasks: usize,
}

#[api_v2_operation(
    description = "Polls and executes a specified number of pending tasks",
    tags(Private)
)]
#[post("/private/protected/task/execute_tasks")]
async fn execute_tasks(
    state: web::Data<State>,
    _: ProtectedCustodianAuthContext,
    request: Json<ExecuteTasksRequest>,
) -> actix_web::Result<Json<ResponseData<ExecuteTasksResponse>>, ApiError> {
    let ExecuteTasksRequest { num_tasks } = request.into_inner();

    let executed_tasks = task::poll_and_execute_tasks(&state, num_tasks).await?;

    Ok(Json(ResponseData::ok(ExecuteTasksResponse {
        num_executed_tasks: executed_tasks.len(),
    })))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateTaskRequest {
    pub task_data: TaskData,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct CreateTasksResponse {
    pub task_id: TaskId,
}

#[api_v2_operation(description = "Creates a single task scheduled for now", tags(Private))]
#[post("/private/protected/task/create_task")]
async fn create_task(
    state: web::Data<State>,
    _: ProtectedCustodianAuthContext,
    request: Json<CreateTaskRequest>,
) -> actix_web::Result<Json<ResponseData<CreateTasksResponse>>, ApiError> {
    let CreateTaskRequest { task_data } = request.into_inner();

    let task = state
        .db_pool
        .db_query(move |conn| -> Result<Task, DbError> { Task::create(conn, Utc::now(), task_data) })
        .await??;

    Ok(Json(ResponseData::ok(CreateTasksResponse { task_id: task.id })))
}
