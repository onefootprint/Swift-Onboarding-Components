use crate::auth::login_session::LoginSessionState;
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
/// Identify a user by email address. If identification is successful, this endpoint issues a text
/// challenge to the user's phone number & returns HTTP 200 with an IdentifyResponse of the last
/// two digits of the user's phone #. If the user is not found, returns IdentifyResponse of user_not_found
pub async fn handler(
    request: Json<IdentifyRequest>,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<IdentifyResponse>>, ApiError> {
    // clean email & look up existing user vault
    let req = request.into_inner();
    let cleaned_email = clean_email(req.email);
    let sh_email = super::hash(cleaned_email.clone());
    let existing_user = db::user_vault::get_by_email(&state.db_pool, sh_email).await?;

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
    LoginSessionState {
        challenge_state: challenge_data.clone(),
    }
    .set(&session)?;

    Ok(Json(ApiResponseData {
        data: IdentifyResponse::PhoneNumberLastTwo(phone_number_last_two(
            challenge_data.phone_number,
        )),
    }))
}
