use crate::auth::user::UserAuthGuard;
use crate::errors::ApiError;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::auth::user::UserObAuthContext;
use db::models::insight_event::CreateInsightEvent;
use db::models::liveness_event::NewLivenessEvent;
use newtypes::WorkflowGuard;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted),
    description = "Allows skipping liveness checks for an onboarding. Only temporary"
)]
#[actix::post("/hosted/onboarding/skip_liveness")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
    insights: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let insight_event = CreateInsightEvent::from(insights).insert_with_conn(conn)?;

            let _ = NewLivenessEvent {
                scoped_vault_id: user_auth.data.scoped_user.id,
                attributes: None,
                liveness_source: newtypes::LivenessSource::Skipped,
                insight_event_id: Some(insight_event.id),
            }
            .insert(conn)?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
