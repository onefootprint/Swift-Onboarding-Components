use super::IdentifyType;
use crate::hosted::identify::IdentifyChallengeData;
use crate::types::response::ApiResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::State;
use crate::{errors::ApiError, hosted::identify::IdentifyChallengeState};
use newtypes::PhoneNumber;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct ChallengeRequest {
    phone_number: PhoneNumber,
    identify_type: IdentifyType,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ChallengeResponse {
    challenge_token: ChallengeToken, // Sealed Challenge<PhoneChallengeState>
    time_before_retry_s: i64,
}

#[api_v2_operation(
    summary = "/hosted/identify/challenge",
    operation_id = "hosted-identify-challenge",
    tags(Hosted, Bifrost),
    description = "Sends a challenge to the phone number and returns an HTTP 200. When the \
    challenge is completed through the identify/verify endpoint, the client can get or create \
    the user with this phone number."
)]
#[post("/challenge")]
pub async fn handler(
    request: Json<ChallengeRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<ChallengeResponse>>, ApiError> {
    // clean phone number
    let req = request.into_inner();

    let twilio_client = &state.twilio_client;

    let phone_number = twilio_client.standardize(&req.phone_number).await?;

    let (challenge_state_data, time_before_retry_s) =
        twilio_client.send_challenge(&state, &phone_number).await?;

    let challenge_state = IdentifyChallengeState {
        identify_type: req.identify_type,
        data: IdentifyChallengeData::Sms(challenge_state_data),
    };

    let challenge_token = Challenge {
        expires_at: challenge_state.expires_at(),
        data: challenge_state,
    }
    .seal(&state.challenge_sealing_key)?;

    Ok(Json(ApiResponseData {
        data: ChallengeResponse {
            challenge_token,
            time_before_retry_s: time_before_retry_s.num_seconds(),
        },
    }))
}
