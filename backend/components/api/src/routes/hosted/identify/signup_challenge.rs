use super::{ChallengeKind, UserChallengeData};
use crate::hosted::identify::ChallengeData;
use crate::types::response::ResponseData;
use crate::utils::challenge::Challenge;
use crate::State;
use crate::{errors::ApiError, hosted::identify::ChallengeState};
use newtypes::PhoneNumber;
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
) -> actix_web::Result<Json<ResponseData<SignupChallengeResponse>>, ApiError> {
    // clean phone number
    let req = request.into_inner();

    let twilio_client = &state.twilio_client;

    let phone_number = twilio_client.standardize(&req.phone_number).await?;

    let (challenge_state_data, time_before_retry_s) =
        twilio_client.send_challenge(&state, &phone_number).await?;

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
                phone_number_last_two: phone_number.leak_last_two(),
                phone_country: phone_number.iso_country_code.leak_to_string(),
                biometric_challenge_json: None,
                time_before_retry_s: time_before_retry_s.num_seconds(),
            },
        },
    }))
}
