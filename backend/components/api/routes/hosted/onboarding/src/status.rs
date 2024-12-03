use crate::auth::user::UserAuthScope;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::types::ApiResponse;
use api_core::utils::requirements::get_requirements_for_person_and_maybe_business;
use api_wire_types::hosted::onboarding_status::OnboardingStatusResponse;
use api_wire_types::onboarding_status::ApiOnboardingRequirement;
use newtypes::OrderedOnboardingRequirements;
use newtypes::WorkflowGuard;
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

    let all_requirements = all_requirements
        .into_iter()
        .map(|r| ApiOnboardingRequirement {
            is_met: r.is_met(),
            old_requirement: r.clone(),
            requirement: r,
        })
        .collect();
    let can_update_user_data = user_auth.check_workflow_guard(WorkflowGuard::AddData).is_ok();
    Ok(OnboardingStatusResponse {
        all_requirements,
        can_update_user_data,
    })
}
