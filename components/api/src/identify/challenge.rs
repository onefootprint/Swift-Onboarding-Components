use super::IdentifyType;
use crate::identify::IdentifyChallengeData;
use crate::types::success::ApiResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::sandbox::default_is_live;
use crate::State;
use crate::{errors::ApiError, identify::IdentifyChallengeState};
use newtypes::{LiveModeConsistency, PhoneNumber};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct ChallengeRequest {
    phone_number: PhoneNumber,
    #[serde(default)]
    identify_type: IdentifyType,
    #[serde(default = "default_is_live")]
    is_live: bool,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ChallengeResponse {
    challenge_token: ChallengeToken, // Sealed Challenge<PhoneChallengeState>
    time_before_retry_s: i64,
}

#[api_v2_operation(tags(Identify))]
#[post("/challenge")]
/// Sends a challenge to the phone number and returns an HTTP 200. When the challenge is completed
/// through the identify/verify endpoint, we will get or create the user with this phone number
pub async fn handler(
    request: Json<ChallengeRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<ChallengeResponse>>, ApiError> {
    // clean phone number
    let req = request.into_inner();

    let twilio_client = &state.twilio_client;

    // check if we've requested a valid phone # for the set mode
    req.phone_number.ensure_live_consistency(req.is_live)?;
    let phone_number = twilio_client.standardize(&req.phone_number).await?;

    let (challenge_state_data, time_before_retry_s) =
        twilio_client.send_challenge(&state, phone_number).await?;

    let challenge_state = IdentifyChallengeState {
        identify_type: req.identify_type,
        data: IdentifyChallengeData::Sms(challenge_state_data),
        is_live: req.is_live,
    };

    let challenge_token = Challenge {
        expires_at: challenge_state.expires_at(),
        data: challenge_state,
    }
    .seal(&state.challenge_sealing_key)?;

    Ok(Json(ApiResponseData {
        data: ChallengeResponse {
            challenge_token,
            time_before_retry_s,
        },
    }))
}
