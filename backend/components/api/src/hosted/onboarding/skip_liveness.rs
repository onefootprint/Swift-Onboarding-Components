use crate::auth::tenant::ParsedOnboardingSession;
use crate::auth::tenant::PublicOnboardingContext;
use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::auth::{Either, SessionContext};
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
use db::models::onboarding::{Onboarding, OnboardingUpdate};
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    summary = "/hosted/onboarding/skip_liveness",
    operation_id = "hosted-onboarding-skip_liveness",
    tags(Hosted),
    description = "Allows skipping liveness checks for an onboarding. Only temporary"
)]
#[post("/skip_liveness")]
fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let ob_config = onboarding_context.ob_config();
            let (onboarding, _) =
                Onboarding::lock_by_config(conn, &user_auth.user_vault_id(), &ob_config.id)?
                    .ok_or(OnboardingError::NoOnboarding)?;
            if onboarding.is_authorized {
                return Err(ApiError::Custom("Cannot edit completed onobarding".to_owned()));
            }
            onboarding.update(conn, OnboardingUpdate::is_liveness_skipped(true))?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
