use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::onboarding::get_requirements;
use crate::types::response::ResponseData;
use crate::State;
use api_core::{
    auth::{
        session::AuthSessionData,
        user::{UserObAuthContext, ValidateUserToken},
    },
    errors::ApiResult,
    types::JsonApiResponse,
    utils::session::AuthSession,
};
use api_wire_types::hosted::validate::ValidateResponse;
use chrono::Duration;
use itertools::Itertools;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Finish onboarding the user. Returns the validation token that can be exchanged for a permanent Footprint user token."
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
        .db_query(move |conn| -> ApiResult<_> {
            let data = AuthSessionData::ValidateUserToken(ValidateUserToken { ob_id });
            let validation_token = AuthSession::create_sync(conn, &session_key, data, Duration::minutes(15))?;
            Ok(validation_token)
        })
        .await??;

    ResponseData::ok(ValidateResponse { validation_token }).json()
}
