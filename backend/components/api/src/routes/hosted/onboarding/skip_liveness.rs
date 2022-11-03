use crate::auth::tenant::ParsedOnboardingSession;
use crate::auth::tenant::PublicOnboardingContext;
use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScopeDiscriminant};
use crate::auth::{Either, SessionContext};
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
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
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let ob_config = onboarding_context.ob_config();
            let (onboarding, _) =
                Onboarding::lock_by_config(conn, &user_auth.user_vault_id(), &ob_config.id)?
                    .ok_or(OnboardingError::NoOnboarding)?;
            if onboarding.is_authorized {
                return Err(ApiError::Custom("Cannot edit completed onboarding".to_owned()));
            }

            let _ = NewLivenessEvent {
                onboarding_id: onboarding.id,
                attributes: None,
                liveness_source: newtypes::LivenessSource::Skipped,
            }
            .insert(conn)?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
