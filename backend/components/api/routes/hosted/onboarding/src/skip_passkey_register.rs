use crate::auth::user::UserAuthScope;
use crate::types::ApiResponse;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::utils::actix::OptionalJson;
use api_core::FpResult;
use api_wire_types::SkipPasskeyRegisterRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::liveness_event::NewLivenessEvent;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Tells us that a passkey registration was skipped"
)]
#[post("/hosted/onboarding/skip_passkey_register")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    insights: InsightHeaders,
    request: OptionalJson<SkipPasskeyRegisterRequest, true>,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let skip_context = request.0.and_then(|r| r.context);
    // Will use this to make sure all clients are sending context before we make required
    tracing::info!(has_context=%skip_context.is_some(), "Skipping passkey register");

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let insight_event = CreateInsightEvent::from(insights).insert_with_conn(conn)?;

            let _ = NewLivenessEvent {
                scoped_vault_id: user_auth.data.scoped_user.id,
                attributes: None,
                liveness_source: newtypes::LivenessSource::Skipped,
                insight_event_id: Some(insight_event.id),
                skip_context,
            }
            .insert(conn)?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
