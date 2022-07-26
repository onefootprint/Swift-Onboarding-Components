use crate::errors::challenge::ChallengeError;
use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::{auth::session_data::SessionData, utils::session::AuthSession};

use crate::errors::ApiError;
use crate::State;
use chrono::Utc;
use db::models::user_data::UserData;
use newtypes::{DataKind, SessionAuthToken};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct EmailVerifyRequest {
    /// The token data in the email link fragment
    data: SessionAuthToken,
}

#[api_v2_operation(tags(User))]
#[post("/verify")]
/// Used to asynchronously verify a user's email address.
/// Requires the token sent to the users email
async fn post(
    state: web::Data<State>,
    request: Json<EmailVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let session = AuthSession::get(&state, &request.data)
        .await?
        .ok_or(ChallengeError::EmailVerificationTokenInvalidOrNotFound)?
        .data;

    if session.expires_at < Utc::now() {
        return Err(ChallengeError::EmailChallengeExpired.into());
    }

    let data = if let SessionData::EmailVerify(data) = session.data {
        Ok(data)
    } else {
        Err(ApiError::from(
            ChallengeError::EmailVerificationTokenInvalidOrNotFound,
        ))
    }?;

    state
        .db_pool
        .db_query(move |conn| UserData::mark_verified(conn, &data.user_data_id, DataKind::Email))
        .await??;

    Ok(Json(ApiResponseData::ok(Empty {})))
}
