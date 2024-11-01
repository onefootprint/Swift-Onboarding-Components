use crate::auth::user::UserAuthScope;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::types::ApiResponse;
use api_core::utils::requirements::get_requirements_for_person_and_maybe_business;
use api_wire_types::hosted::onboarding_status::OnboardingStatusResponse;
use newtypes::OrderedOnboardingRequirements;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Returns the remaining onboarding requirements to complete the onboarding."
)]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
) -> ApiResponse<OnboardingStatusResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let reqs = get_requirements_for_person_and_maybe_business(&state, &user_auth).await?;

    let ob_config = &user_auth.ob_config;
    let all_requirements = OrderedOnboardingRequirements::from_unordered(reqs, ob_config.is_doc_first);

    Ok(OnboardingStatusResponse::from_db(all_requirements))
}
