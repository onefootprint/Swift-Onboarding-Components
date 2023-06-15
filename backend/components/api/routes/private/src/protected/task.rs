use crate::auth::protected_custodian::ProtectedCustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::{task, State};
use chrono::Utc;
use db::models::task::{Task, TaskCreateArgs};
use db::models::watchlist_check::WatchlistCheck;
use db::DbError;
use newtypes::{TaskData, TaskId, TenantId, WatchlistCheckArgs};
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

    let executed_tasks = task::poll_and_execute_tasks(&state, num_tasks, None).await?;

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

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateOverdueWatchlistCheckTasksRequest {
    pub tenant_id: TenantId,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct CreateOverdueWatchlistCheckTasksResponse {
    pub num_created_tasks: usize,
    pub created_tasks: Vec<TaskId>,
}

#[api_v2_operation(
    description = "Creates WatchlistCheckTask's for livemode vaults that have not had a watchlist check in the past 30 days",
    tags(Private)
)]
#[post("/private/protected/task/create_overdue_watchlist_check_tasks")]
async fn create_overdue_watchlist_check_tasks(
    state: web::Data<State>,
    _: ProtectedCustodianAuthContext,
    request: Json<CreateOverdueWatchlistCheckTasksRequest>,
) -> actix_web::Result<Json<ResponseData<CreateOverdueWatchlistCheckTasksResponse>>, ApiError> {
    let CreateOverdueWatchlistCheckTasksRequest { tenant_id } = request.into_inner();

    let new_tasks = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let overdue_svs = WatchlistCheck::get_overdue_scoped_vaults(conn, tenant_id)?;
            let now = Utc::now();
            let task_args: Vec<TaskCreateArgs> = overdue_svs
                .into_iter()
                .map(|sv| TaskCreateArgs {
                    scheduled_for: now,
                    task_data: TaskData::WatchlistCheck(WatchlistCheckArgs { scoped_vault_id: sv }),
                })
                .collect();
            Task::bulk_create(conn, task_args)
        })
        .await??;

    let created_tasks: Vec<TaskId> = new_tasks.into_iter().map(|t| t.id).collect();
    Ok(Json(ResponseData::ok(CreateOverdueWatchlistCheckTasksResponse {
        num_created_tasks: created_tasks.len(),
        created_tasks,
    })))
}
