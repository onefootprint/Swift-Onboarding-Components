use crate::types::success::ApiResponseData;
use crate::utils::challenge::ChallengeToken;
use crate::State;
use crate::{errors::ApiError};
use newtypes::PhoneNumber;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct ChallengeRequest {
    phone_number: PhoneNumber,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ChallengeResponse {
    challenge_token: ChallengeToken, // Sealed Challenge<PhoneChallengeState>
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

    let client = awc::Client::default();

    let twilio_client = &state.twilio_client;

    let phone_number = twilio_client.standardize(&client, req.phone_number).await?;

    let challenge_token = twilio_client
        .send_challenge(
            &client,
            &state.db_pool,
            phone_number,
            &state.session_sealing_key,
        )
        .await?;

    Ok(Json(ApiResponseData {
        data: ChallengeResponse { challenge_token },
    }))
}
