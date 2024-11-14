use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::task;
use api_core::types::ApiResponse;
use api_core::State;
use chrono::Utc;
use db::models::task::Task;
use newtypes::TaskData;
use newtypes::TaskId;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ExecuteTasksRequest {
    pub num_tasks: u32,
}

#[post("/private/protected/task/execute_tasks")]
async fn execute_tasks(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<ExecuteTasksRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let ExecuteTasksRequest { num_tasks } = request.into_inner();
    task::poll_and_execute_tasks_non_blocking((*state.into_inner()).clone(), num_tasks, None);
    Ok(api_wire_types::Empty)
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct CreateTaskRequest {
    pub task_data: TaskData,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct CreateTasksResponse {
    pub task_id: TaskId,
}

#[post("/private/protected/task/create_task")]
async fn create_task(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<CreateTaskRequest>,
) -> ApiResponse<CreateTasksResponse> {
    let CreateTaskRequest { task_data } = request.into_inner();

    let task = state
        .db_query(move |conn| Task::create(conn, Utc::now(), task_data))
        .await?;

    Ok(CreateTasksResponse { task_id: task.id })
}
