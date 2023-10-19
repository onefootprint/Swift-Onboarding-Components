use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::types::response::ResponseData;
use crate::State;
use api_core::{
    auth::{
        session::{user::ValidateUserToken, AuthSessionData},
        user::UserWfAuthContext,
    },
    errors::ApiResult,
    types::JsonApiResponse,
    utils::session::AuthSession,
};
use api_wire_types::hosted::validate::HostedValidateResponse;
use chrono::Duration;
use itertools::Itertools;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Finish onboarding the user. Returns the validation token that can be exchanged for a permanent Footprint user token."
)]
#[actix::post("/hosted/onboarding/validate")]
pub async fn post(
    user_auth: UserWfAuthContext,
    state: web::Data<State>,
) -> JsonApiResponse<HostedValidateResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;

    // Verify there are no unmet requirements
    let reqs = api_core::utils::requirements::get_requirements(
        &state,
        api_core::utils::requirements::GetRequirementsArgs::from(&user_auth)?,
    )
    .await?;
    let unmet_reqs = reqs.into_iter().filter(|r| !r.is_met()).collect_vec();
    if !unmet_reqs.is_empty() {
        let unmet_reqs = unmet_reqs.into_iter().map(|x| x.into()).collect_vec();
        return Err(OnboardingError::UnmetRequirements(unmet_reqs.into()).into());
    }

    let wf_id = user_auth.workflow().id.clone();
    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let data = AuthSessionData::ValidateUserToken(ValidateUserToken { wf_id });
            let (token, _) = AuthSession::create_sync(conn, &session_key, data, Duration::minutes(15))?;
            Ok(token)
        })
        .await??;

    ResponseData::ok(HostedValidateResponse { validation_token }).json()
}
