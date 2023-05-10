use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::onboarding::get_requirements;
use crate::types::response::ResponseData;
use crate::State;
use api_core::{auth::user::UserObAuthContext, types::JsonApiResponse};
use api_wire_types::hosted::validate::ValidateResponse;
use itertools::Itertools;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Finish onboarding the user. Processes the collected data and returns the validation token that can be exchanged for a permanent Footprint user token."
)]
#[actix::post("/hosted/onboarding/validate")]
pub async fn post(
    user_auth: UserObAuthContext,
    state: web::Data<State>,
) -> JsonApiResponse<ValidateResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    // Verify there are no unmet requirements
    let (reqs, user_auth) = get_requirements(&state, user_auth).await?;
    if !reqs.is_empty() {
        let unmet_requirements = reqs.into_iter().map(|x| x.into()).collect_vec();
        return Err(OnboardingError::UnmetRequirements(unmet_requirements.into()).into());
    }

    let session_key = state.session_sealing_key.clone();
    let ob_id = user_auth.onboarding()?.id.clone();
    let validation_token = state
        .db_pool
        .db_query(move |conn| super::create_onboarding_validation_token(conn, &session_key, ob_id))
        .await??;

    ResponseData::ok(ValidateResponse { validation_token }).json()
}
