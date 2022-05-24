use crate::errors::ApiError;
use crate::identify::{clean_phone_number, send_phone_challenge};
use crate::types::success::ApiResponseData;
use crate::State;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ChallengeRequest {
    phone_number: String,
}

#[api_v2_operation(tags(Identify))]
#[post("/phone")]
/// Initiates a log in for a user with the provided phone number. Can be used regardless of
/// whether a user vault exists with this phone number. Sends a challenge to the phone number
/// and returns an HTTP 200.
pub async fn handler(
    request: Json<ChallengeRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<super::ChallengeResponse>>, ApiError> {
    // clean phone number
    let req = request.into_inner();
    let phone_number = clean_phone_number(&state, &req.phone_number).await?;

    // Send the log in challenge to the provided phone number
    let challenge = send_phone_challenge(&state, phone_number.clone()).await?;

    Ok(Json(ApiResponseData {
        data: super::ChallengeResponse::new(challenge, &state.session_sealing_key)?,
    }))
}
