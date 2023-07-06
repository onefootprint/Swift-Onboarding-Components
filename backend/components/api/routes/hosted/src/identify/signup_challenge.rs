use super::{ChallengeKind, UserChallengeData};
use crate::identify::ChallengeData;
use crate::types::response::ResponseData;
use crate::utils::challenge::Challenge;
use crate::State;
use crate::{errors::ApiError, identify::ChallengeState};
use api_core::auth::ob_config::ObConfigAuth;
use api_core::utils::headers::SandboxId;
use newtypes::{PhoneNumber, PiiString};
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct SignupChallengeRequest {
    phone_number: PhoneNumber,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct SignupChallengeResponse {
    challenge_data: UserChallengeData,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Sends a challenge to a phone number and returns an HTTP 200. When the \
    challenge is completed through the identify/verify endpoint, the client can get or create \
    the user with this phone number."
)]
#[actix::post("/hosted/identify/signup_challenge")]
pub async fn post(
    request: Json<SignupChallengeRequest>,
    state: web::Data<State>,
    ob_context: Option<ObConfigAuth>,
    // When provided, creates a sandbox user with the given suffix
    sandbox_id: SandboxId,
) -> actix_web::Result<Json<ResponseData<SignupChallengeResponse>>, ApiError> {
    let SignupChallengeRequest { phone_number } = request.into_inner();
    let tenant_name = ob_context.as_ref().map(|obc| obc.tenant().name.clone());
    // TODO clean up when when sandbox_id no longer in phone number
    let phone_number = if let Some(sandbox_id) = sandbox_id.0.clone() {
        let number = PiiString::new(format!("{}#{}", phone_number.e164().leak(), sandbox_id));
        PhoneNumber::parse(number)?
    } else {
        phone_number
    };
    let (challenge_state_data, time_before_retry_s) = state
        .twilio_client
        .send_challenge(&state, tenant_name, &phone_number, sandbox_id.0)
        .await?;

    let challenge_state = ChallengeState {
        data: ChallengeData::Sms(challenge_state_data),
    };

    let challenge_token = Challenge {
        expires_at: challenge_state.expires_at(),
        data: challenge_state,
    }
    .seal(&state.challenge_sealing_key)?;

    Ok(Json(ResponseData {
        data: SignupChallengeResponse {
            challenge_data: UserChallengeData {
                challenge_kind: ChallengeKind::Sms,
                challenge_token,
                scrubbed_phone_number: phone_number.last_two(),
                biometric_challenge_json: None,
                time_before_retry_s: time_before_retry_s.num_seconds(),
            },
        },
    }))
}
