use crate::auth::user::{UserAuthContext, UserAuthScopeDiscriminant};
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::insight_headers::InsightHeaders;
use crate::State;
use db::models::insight_event::CreateInsightEvent;
use db::models::liveness_event::NewLivenessEvent;
use db::models::onboarding::Onboarding;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted),
    description = "Allows skipping liveness checks for an onboarding. Only temporary"
)]
#[actix::post("/hosted/onboarding/skip_liveness")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    insights: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let ob_info = user_auth.assert_onboarding(conn)?;
            let ob_config = ob_info.ob_config;
            let (onboarding, _) = Onboarding::lock_by_config(conn, &ob_info.user_vault_id, &ob_config.id)?
                .ok_or(OnboardingError::NoOnboarding)?;
            if onboarding.is_authorized {
                return Err(ApiError::Custom("Cannot edit completed onboarding".to_owned()));
            }

            let insight_event = CreateInsightEvent::from(insights).insert_with_conn(conn)?;

            let _ = NewLivenessEvent {
                onboarding_id: onboarding.id,
                attributes: None,
                liveness_source: newtypes::LivenessSource::Skipped,
                insight_event_id: insight_event.id,
            }
            .insert(conn)?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
