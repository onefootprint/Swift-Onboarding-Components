use crate::auth::tenant::ParsedOnboardingSession;
use crate::auth::tenant::PublicOnboardingContext;
use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::auth::Either;
use crate::auth::SessionContext;
use crate::errors::ApiError;
use crate::hosted::onboarding::get_requirements;
use crate::types::onboarding_requirement::OnboardingRequirement;
use crate::types::response::ResponseData;
use crate::State;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingStatusResponse {
    requirements: Vec<OnboardingRequirement>,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Gets or creates the Onboarding for this (user, ob_config) pair."
)]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<OnboardingStatusResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let (requirements, _) = state
        .db_pool
        .db_query(move |conn| {
            get_requirements(conn, &user_auth.user_vault_id(), onboarding_context.ob_config())
        })
        .await??;

    ResponseData::ok(OnboardingStatusResponse { requirements }).json()
}
