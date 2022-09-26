use crate::auth::key_context::ob_public_key::PublicOnboardingContext;
use crate::auth::session_data::ob_session::ParsedOnboardingSession;
use crate::auth::session_data::user::UserAuthScope;
use crate::auth::Either;
use crate::auth::SessionContext;
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::errors::ApiError;
use crate::hosted::onboarding::get_requirements;
use crate::types::response::ResponseData;
use crate::State;
use newtypes::onboarding_requirement::OnboardingRequirement;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingStatusResponse {
    requirements: Vec<OnboardingRequirement>,
}

#[api_v2_operation(
    summary = "/hosted/onboarding/status",
    operation_id = "hosted-onboarding",
    tags(Hosted, Bifrost),
    description = "Gets or creates the Onboarding for this (user, ob_config) pair."
)]
#[get("/status")]
pub fn get(
    state: web::Data<State>,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
    user_auth: UserAuth,
) -> actix_web::Result<Json<ResponseData<OnboardingStatusResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let (requirements, _) = state
        .db_pool
        .db_query(move |conn| {
            get_requirements(conn, &user_auth.user_vault_id(), &onboarding_context.ob_config())
        })
        .await??;

    ResponseData::ok(OnboardingStatusResponse { requirements }).json()
}
