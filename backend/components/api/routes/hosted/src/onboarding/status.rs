use crate::errors::ApiError;
use crate::onboarding::get_requirements;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use crate::{auth::user::UserAuthGuard, onboarding::GetRequirementsArgs};
use api_core::auth::user::UserWfAuthContext;
use api_wire_types::hosted::onboarding_status::{ApiOnboardingRequirement, OnboardingStatusResponse};
use itertools::Itertools;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(tags(Hosted, Bifrost), description = "Returns the status of the onboarding.")]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
) -> actix_web::Result<Json<ResponseData<OnboardingStatusResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    let reqs = get_requirements(&state, GetRequirementsArgs::from(&user_auth)?).await?;
    let all_requirements = reqs
        .into_iter()
        .map(|r| ApiOnboardingRequirement {
            is_met: r.is_met(),
            requirement: r,
        })
        .collect_vec();
    let ob_config = user_auth.ob_config()?.clone();
    let tenant = user_auth.tenant()?.clone();
    let ff_client = state.feature_flag_client.clone();
    let ob_config =
        api_wire_types::PublicOnboardingConfiguration::from_db((ob_config, tenant, None, None, ff_client));

    ResponseData::ok(OnboardingStatusResponse {
        all_requirements,
        // This is only used by the handoff app - we might be able to rm and move elsewhere
        ob_configuration: ob_config,
    })
    .json()
}
