use crate::errors::ApiError;
use crate::identify::{clean_phone_number, phone_number_last_two, send_phone_challenge};
use crate::types::success::ApiResponseData;
use crate::State;
use actix_session::Session;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ChallengeRequest {
    phone_number: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ChallengeResponse {
    phone_number_last_two: String,
}

#[api_v2_operation]
#[post("/phone")]
/// Initiates a log in for a user with the provided phone number. Can be used regardless of
/// whether a user vault exists with this phone number. Sends a challenge to the phone number
/// and returns an HTTP 200.
pub async fn handler(
    request: Json<ChallengeRequest>,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<ChallengeResponse>>, ApiError> {
    // clean phone number
    let req = request.into_inner();
    let phone_number = clean_phone_number(&state, &req.phone_number).await?;

    // Send the log in challenge to the provided phone number
    let challenge_data = send_phone_challenge(&state, phone_number.clone()).await?;

    // Save the challenge state in the session
    challenge_data.clone().set(&session)?;

    Ok(Json(ApiResponseData {
        data: ChallengeResponse {
            phone_number_last_two: phone_number_last_two(challenge_data.phone_number),
        },
    }))
}
