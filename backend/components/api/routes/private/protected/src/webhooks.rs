use crate::ProtectedAuth;
use actix_web::web::Json;
use actix_web::{
    post,
    web,
};
use api_core::errors::{
    ApiResult,
    AssertionError,
    ValidationError,
};
use api_core::types::ModernApiResult;
use api_core::{
    task,
    State,
};
use chrono::Utc;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::{
    ScopedVault,
    SerializableEntity,
};
use db::models::task::{
    Task,
    TaskCreateArgs,
};
use db::PgConn;
use itertools::Itertools;
use newtypes::{
    FpId,
    OnboardingCompletedPayload,
    TaskData,
    TaskId,
    TenantId,
    WebhookEvent,
    WebhookEventKind,
};

#[derive(Debug, Clone, serde::Deserialize)]
pub struct PostWebhooksRequest {
    pub fp_ids: Vec<FpId>,
    pub kind: WebhookEventKind,
    pub tenant_id: TenantId,
    pub is_live: bool,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct CreateTasksResponse {
    pub task_id: TaskId,
}

#[post("/private/protected/webhooks")]
async fn post(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<PostWebhooksRequest>,
) -> ModernApiResult<api_wire_types::Empty> {
    let PostWebhooksRequest {
        fp_ids,
        kind,
        tenant_id,
        is_live,
    } = request.into_inner();
    let num_fp_ids = fp_ids.len();

    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let svs = ScopedVault::bulk_get(conn, fp_ids, &tenant_id, is_live)?;
            let sv_ids = svs.into_iter().map(|(sv, _)| sv.id).collect_vec();
            let entities = ScopedVault::bulk_get_serializable_info(conn, sv_ids)?;
            let task_data = entities
                .into_values()
                .map(|entity| create_webhook_event(conn, entity, kind))
                .map_ok(|task_data| TaskCreateArgs {
                    scheduled_for: Utc::now(),
                    task_data,
                })
                .collect::<ApiResult<Vec<_>>>()?;
            Task::bulk_create(conn, task_data)?;
            Ok(())
        })
        .await?;

    task::poll_and_execute_tasks_non_blocking((*state.into_inner()).clone(), num_fp_ids as u32, None);
    Ok(api_wire_types::Empty)
}

fn create_webhook_event(
    conn: &mut PgConn,
    entity: SerializableEntity,
    kind: WebhookEventKind,
) -> ApiResult<TaskData> {
    let (sv, _, _, _, mrs, wfs, _) = entity;
    let (latest_wf, _) = wfs
        .into_iter()
        .filter(|(wf, _)| wf.completed_at.is_some())
        .max_by_key(|(wf, _)| wf.completed_at)
        .ok_or(AssertionError(&format!("No completed workflow for {}", sv.fp_id)))?;
    let (obc, _) = ObConfiguration::get(conn, &latest_wf.ob_configuration_id)?;
    let event = match kind {
        WebhookEventKind::OnboardingCompleted => {
            WebhookEvent::OnboardingCompleted(OnboardingCompletedPayload {
                fp_id: sv.fp_id.clone(),
                timestamp: Utc::now(),
                status: sv.status,
                playbook_key: obc.key,
                requires_manual_review: !mrs.is_empty(),
                is_live: sv.is_live,
            })
        }
        _ => return ValidationError("Unsupported event kind").into(),
    };
    let task_data = sv.webhook_event(event).into();
    Ok(task_data)
}
