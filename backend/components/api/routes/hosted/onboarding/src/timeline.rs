use crate::auth::user::UserAuthScope;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::types::ApiResponse;
use api_core::utils::headers::InsightHeaders;
use api_core::web::Json;
use api_wire_types::CreateOnboardingTimelineRequest;
use db::models::user_timeline::UserTimeline;
use newtypes::OnboardingTimelineInfo;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Log a timeline event for this user using a frontend-provided page identifier"
)]
#[actix::post("/hosted/onboarding/timeline")]
pub async fn post(
    user_auth: UserWfAuthContext,
    state: web::Data<State>,
    request: Json<CreateOnboardingTimelineRequest>,
    insights: InsightHeaders,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let CreateOnboardingTimelineRequest { event } = request.into_inner();

    let session_id = insights.session_id;
    let event = OnboardingTimelineInfo { event, session_id };
    let v_id = user_auth.user().id.clone();
    let sv_id = user_auth.scoped_user.id.clone();
    state
        .db_pool
        .db_transaction(move |conn| UserTimeline::create(conn, event, v_id, sv_id))
        .await?;

    Ok(api_wire_types::Empty)
}
