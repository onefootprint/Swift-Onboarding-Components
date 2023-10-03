use super::{ChallengeKind, UserChallengeData};
use crate::identify::{self, ChallengeData};
use crate::types::response::ResponseData;
use crate::utils::challenge::Challenge;
use crate::State;
use crate::{errors::ApiError, identify::ChallengeState};
use api_core::auth::ob_config::ObConfigAuth;
use api_core::errors::challenge::ChallengeError;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::ApiResult;
use api_core::utils::headers::SandboxId;
use newtypes::email::Email;
use newtypes::PhoneNumber;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(untagged)]
pub enum SignupChallengeRequest {
    Phone(SignupChallengeRequestPhone),
    Email(SignupChallengeRequestEmail),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct SignupChallengeRequestPhone {
    phone_number: PhoneNumber,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct SignupChallengeRequestEmail {
    email: Email,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct SignupChallengeResponse {
    challenge_data: UserChallengeData,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Sends a challenge to a phone number or email and returns an HTTP 200. When the \
    challenge is completed through the identify/verify endpoint, the client can begin onboarding the user."
)]
#[actix::post("/hosted/identify/signup_challenge")]
pub async fn post(
    request: Json<SignupChallengeRequest>,
    state: web::Data<State>,
    ob_context: Option<ObConfigAuth>,
    // When provided, creates a sandbox user with the given suffix
    sandbox_id: SandboxId,
) -> actix_web::Result<Json<ResponseData<SignupChallengeResponse>>, ApiError> {
    let challenge_data: ApiResult<UserChallengeData> = match request.into_inner() {
        SignupChallengeRequest::Phone(req) => {
            let tenant = ob_context.as_ref().map(|obc| obc.tenant());
            let (challenge_state_data, time_before_retry_s) = state
                .sms_client
                .send_challenge_non_blocking(&state, tenant, &req.phone_number, sandbox_id.0)
                .await?;

            let challenge_state = ChallengeState {
                data: ChallengeData::Sms(challenge_state_data),
            };

            let challenge_token = Challenge {
                expires_at: challenge_state.expires_at(),
                data: challenge_state,
            }
            .seal(&state.challenge_sealing_key)?;
            let challenge_data = UserChallengeData {
                challenge_kind: ChallengeKind::Sms,
                challenge_token,
                scrubbed_phone_number: Some(req.phone_number.last_two()),
                biometric_challenge_json: None,
                time_before_retry_s: time_before_retry_s.num_seconds(),
            };
            Ok(challenge_data)
        }
        SignupChallengeRequest::Email(req) => {
            let auth = ob_context.as_ref().ok_or(OnboardingError::MissingObPkAuth)?;
            let obc = auth.ob_config();
            let tenant = auth.tenant();

            if !obc.is_no_phone_flow {
                return Err(ApiError::from(ChallengeError::ChallengeKindNotAllowed(
                    "email".to_string(),
                )));
            };

            let challenge_data =
                identify::send_email_challenge_non_blocking(&state, &req.email, tenant, sandbox_id.0)?;

            let challenge_state = ChallengeState { data: challenge_data };

            let challenge_token = Challenge {
                expires_at: challenge_state.expires_at(),
                data: challenge_state,
            }
            .seal(&state.challenge_sealing_key)?;

            let challenge_data = UserChallengeData {
                challenge_kind: ChallengeKind::Email,
                challenge_token,
                scrubbed_phone_number: None,
                biometric_challenge_json: None,
                time_before_retry_s: state.config.time_s_between_sms_challenges,
            };
            Ok(challenge_data)
        }
    };

    Ok(Json(ResponseData {
        data: SignupChallengeResponse {
            challenge_data: challenge_data?,
        },
    }))
}
