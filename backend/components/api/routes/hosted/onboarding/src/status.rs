use crate::auth::user::UserAuthScope;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::types::ApiResponse;
use api_core::utils::requirements::GetRequirementsArgs;
use api_wire_types::hosted::onboarding_status::ApiOnboardingRequirement;
use api_wire_types::hosted::onboarding_status::OnboardingStatusResponse;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Returns the status of the onboarding."
)]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
) -> ApiResponse<OnboardingStatusResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let reqs = api_core::utils::requirements::get_requirements_for_person_and_maybe_business(
        &state,
        GetRequirementsArgs::from(&user_auth)?,
    )
    .await?;
    let all_requirements = reqs
        .into_iter()
        .map(|r| ApiOnboardingRequirement {
            is_met: r.is_met(),
            requirement: r,
        })
        .collect_vec();
    let ob_config = user_auth.ob_config().clone();
    let tenant = user_auth.tenant().clone();
    let ff_client = state.ff_client.clone();
    let ob_config = api_wire_types::PublicOnboardingConfiguration::from_db((
        ob_config, tenant, None, None, ff_client, None,
    ));

    Ok(OnboardingStatusResponse {
        all_requirements,
        // This is only used by the handoff app - we might be able to rm and move elsewhere
        ob_configuration: ob_config,
    })
}
