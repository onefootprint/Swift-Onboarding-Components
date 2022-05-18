use crate::errors::ApiError;
use crate::identify::clean_email;
use crate::types::success::ApiResponseData;
use crate::State;
use actix_session::Session;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use super::{phone_number_last_two, send_phone_challenge_to_user};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    email: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum IdentifyResponse {
    PhoneNumberLastTwo(String),
    UserNotFound,
}

#[api_v2_operation]
#[post("/email")]
/// Attempt to log a user in by email address. Only if there already exists a user vault with this email,
/// sends a challenge to the user's phone number and returns HTTP 200 with an IdentifyResponse including
/// the last two digits of the user's phone number. If the user is not found, returns IdentifyResponse of user_not_found
pub async fn handler(
    request: Json<IdentifyRequest>,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<IdentifyResponse>>, ApiError> {
    // clean email & look up existing user vault
    let req = request.into_inner();
    let cleaned_email = clean_email(req.email);
    let sh_email = super::signed_hash(&state, cleaned_email.clone()).await?;
    // TODO we should only look for verified emails, but this will break integration tests
    // since we don't verify the email in tests
    let existing_user = db::user_vault::get_by_email(&state.db_pool, sh_email, false)
        .await?
        .map(|x| x.0);

    // see if user vault has an associated phone number. if not, set session state to info we currently have &
    // return user not found
    let existing_user = if let Some(existing_user) = existing_user {
        existing_user
    } else {
        return Ok(Json(ApiResponseData {
            data: IdentifyResponse::UserNotFound,
        }));
    };

    // Send the log in challenge to the user's phone number
    let challenge_data = send_phone_challenge_to_user(&state, existing_user).await?;

    // Save the challenge state in the session
    challenge_data.clone().set(&session)?;

    Ok(Json(ApiResponseData {
        data: IdentifyResponse::PhoneNumberLastTwo(phone_number_last_two(
            challenge_data.phone_number,
        )),
    }))
}
