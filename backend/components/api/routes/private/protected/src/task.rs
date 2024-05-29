use crate::ProtectedAuth;
use actix_web::web::Json;
use actix_web::{
    post,
    web,
};
use api_core::errors::ApiError;
use api_core::types::response::ResponseData;
use api_core::types::{
    EmptyResponse,
    JsonApiResponse,
};
use api_core::{
    task,
    State,
};
use chrono::Utc;
use db::models::task::Task;
use db::DbError;
use newtypes::{
    TaskData,
    TaskId,
};

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ExecuteTasksRequest {
    pub num_tasks: u32,
}

#[post("/private/protected/task/execute_tasks")]
async fn execute_tasks(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<ExecuteTasksRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let ExecuteTasksRequest { num_tasks } = request.into_inner();
    task::poll_and_execute_tasks_non_blocking((*state.into_inner()).clone(), num_tasks, None);
    EmptyResponse::ok().json()
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct CreateTaskRequest {
    pub task_data: TaskData,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct CreateTasksResponse {
    pub task_id: TaskId,
}

#[post("/private/protected/task/create_task")]
async fn create_task(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<CreateTaskRequest>,
) -> actix_web::Result<Json<ResponseData<CreateTasksResponse>>, ApiError> {
    let CreateTaskRequest { task_data } = request.into_inner();

    let task = state
        .db_pool
        .db_query(move |conn| -> Result<Task, DbError> { Task::create(conn, Utc::now(), task_data) })
        .await?;

    Ok(Json(ResponseData::ok(CreateTasksResponse { task_id: task.id })))
}
