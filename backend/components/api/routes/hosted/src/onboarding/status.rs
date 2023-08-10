use crate::errors::ApiError;
use crate::onboarding::get_requirements;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use crate::{auth::user::UserAuthGuard, onboarding::GetRequirementsArgs};
use api_core::auth::user::UserObAuthContext;
use api_wire_types::hosted::onboarding_status::OnboardingStatusResponse;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(tags(Hosted, Bifrost), description = "Returns the status of the onboarding.")]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
) -> actix_web::Result<Json<ResponseData<OnboardingStatusResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    let reqs = get_requirements(&state, GetRequirementsArgs::from(&user_auth)?).await?;
    let (met_requirements, requirements) = reqs.into_iter().partition(|r| r.is_met());
    let ob_config = user_auth.ob_config()?.clone(); // TODO want to start getting ob config from workflow
    let tenant = user_auth.tenant()?.clone();
    let ff_client = state.feature_flag_client.clone();
    let ob_config = api_wire_types::OnboardingConfiguration::from_db((ob_config, tenant, None, ff_client));

    ResponseData::ok(OnboardingStatusResponse {
        requirements,
        met_requirements,
        // This is only used by the handoff app - we might be able to rm and move elsewhere
        ob_configuration: ob_config,
    })
    .json()
}
