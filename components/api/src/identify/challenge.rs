use crate::errors::ApiError;
use crate::identify::{clean_phone_number, send_phone_challenge};
use crate::types::success::ApiResponseData;
use crate::utils::challenge::ChallengeToken;
use crate::State;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct ChallengeRequest {
    phone_number: String,
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
    let phone_number = clean_phone_number(&state, &req.phone_number).await?;

    // Send the log in challenge to the provided phone number
    let challenge_token = send_phone_challenge(&state, phone_number.clone()).await?;

    Ok(Json(ApiResponseData {
        data: ChallengeResponse { challenge_token },
    }))
}
