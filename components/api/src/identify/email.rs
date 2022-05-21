use crate::errors::ApiError;
use crate::identify::clean_email;
use crate::types::success::ApiResponseData;
use crate::State;
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use super::send_phone_challenge_to_user;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    email: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyResponse {
    user_found: bool,
    challenge_data: Option<super::ChallengeResponse>,
}

#[api_v2_operation]
#[post("/email")]
/// Attempt to log a user in by email address. Only if there already exists a user vault with this email,
/// sends a challenge to the user's phone number and returns HTTP 200 with an IdentifyResponse including
/// the last two digits of the user's phone number. If the user is not found, returns IdentifyResponse of user_not_found
pub async fn handler(
    request: Json<IdentifyRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<IdentifyResponse>>, ApiError> {
    // clean email & look up existing user vault
    let req = request.into_inner();
    let cleaned_email = clean_email(req.email);
    let sh_email = super::signed_hash(&state, cleaned_email.clone()).await?;
    // TODO we should only look for verified emails, but this will break integration tests
    // since we don't verify the email in tests
    let existing_user =
        db::user_vault::get_by_fingerprint(&state.db_pool, DataKind::Email, sh_email, false)
            .await?
            .map(|x| x.0);

    // see if user vault has an associated phone number.
    let response = if let Some(existing_user) = existing_user {
        // The user vault exists. Send the log in challenge to the user's phone number
        let challenge = send_phone_challenge_to_user(&state, existing_user).await?;
        IdentifyResponse {
            user_found: true,
            challenge_data: Some(super::ChallengeResponse::new(
                challenge,
                &state.session_sealing_key,
            )?),
        }
    } else {
        // The user vault doesn't exist. Just return that the challenge data wasn't found
        IdentifyResponse {
            user_found: false,
            challenge_data: None,
        }
    };

    Ok(Json(ApiResponseData { data: response }))
}
