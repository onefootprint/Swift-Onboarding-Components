use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::auth::login_session::{LoginSessionContext, LoginSessionState};
use crate::errors::ApiError;
use crate::identify::{
    clean_email, clean_phone_number, hash, phone_number_last_two, send_phone_challenge_to_user,
    validate_challenge,
};
use crate::response::success::ApiResponseData;
use crate::State;
use actix_session::Session;
use db::models::session_data::{LoggedInSessionData, SessionState as DbSessionState};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChallengeRequest {
    Email(String),
    PhoneNumber(String),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ChallengeResponse {
    phone_number_last_two: String,
}

#[api_v2_operation]
#[post("/login")]
/// Issues a text message challenge to an existing user, identified by either phone number or email.
pub async fn login(
    request: Json<ChallengeRequest>,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<ChallengeResponse>>, ApiError> {
    // Fetch the user by email or phone number depending on what was provided
    let existing_user = match request.0.clone() {
        ChallengeRequest::Email(s) => {
            let cleaned_data = clean_email(s);
            let sh_email = hash(cleaned_data);
            db::user_vault::get_by_email(&state.db_pool, sh_email).await?
        }
        ChallengeRequest::PhoneNumber(p) => {
            let cleaned_data = clean_phone_number(&state, &p).await?;
            let sh_phone_number = hash(cleaned_data);
            db::user_vault::get_by_phone_number(&state.db_pool, sh_phone_number.clone()).await?
        }
    };
    let existing_user = existing_user.ok_or(ApiError::UserDoesntExist)?;

    // Send the log in challenge to the user's phone number
    let challenge_data = send_phone_challenge_to_user(&state, existing_user).await?;

    // Save the challenge state in the session
    LoginSessionState {
        challenge_state: challenge_data.clone(),
    }
    .set(&session)?;

    Ok(Json(ApiResponseData {
        data: ChallengeResponse {
            phone_number_last_two: phone_number_last_two(challenge_data.phone_number),
        },
    }))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct VerifyRequest {
    code: String,
}

#[api_v2_operation]
#[post("/login/verify")]
/// Verify an SMS challenge sent to a user. If successful, this endpoint sets relevant cookies
/// that tell us the client is authenticated as a specific user
async fn verify(
    state: web::Data<State>,
    session: Session,
    session_context: LoginSessionContext,
    request: Json<VerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<()>>, ApiError> {
    let challenge_data = session_context.state.challenge_state;

    if !validate_challenge(request.code.clone(), &challenge_data).await? {
        return Err(ApiError::ChallengeNotValid);
    }

    let phone_number = challenge_data.phone_number;
    let sh_phone_number = hash(phone_number.clone());
    let existing_user =
        db::user_vault::get_by_phone_number(&state.db_pool, sh_phone_number.clone()).await?;

    let existing_user = existing_user.ok_or(ApiError::UserDoesntExist)?;

    // Save logged in session data into the DB
    let (_, token) = DbSessionState::LoggedInSession(LoggedInSessionData {
        user_vault_id: existing_user.id,
    })
    .create(&state.db_pool)
    .await?;
    // Set the cookie that identifies this as a LoggedInSession and attaches it to the DB state
    LoggedInSessionContext::set(&session, token)?;

    Ok(Json(ApiResponseData { data: () }))
}
