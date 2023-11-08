use crate::auth::user::UserAuthGuard;
use crate::errors::ApiError;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use db::models::insight_event::CreateInsightEvent;
use db::models::liveness_event::NewLivenessEvent;
use macros::route_alias;
use newtypes::WorkflowGuard;
use paperclip::actix::{api_v2_operation, post, web};

#[route_alias(post(
    "/hosted/onboarding/skip_liveness",
    tags(Onboarding, Hosted),
    description = "Allows skipping passkeys if the device doesn't support it"
))] // TODO: remove alias once deploys
#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Tells us that a passkey registration was skipped"
)]
#[post("/hosted/onboarding/skip_passkey_register")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    insights: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
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
