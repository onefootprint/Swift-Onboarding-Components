use crate::auth::session_data::SessionData;
use crate::errors::challenge::ChallengeError;
use crate::types::success::ApiResponseData;
use crate::types::Empty;

use crate::State;
use crate::{auth::session_data::ServerSession, errors::ApiError};
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
    let session = db::session::get_session_by_auth_token(&state.db_pool, request.into_inner().data)
        .await?
        .ok_or(ChallengeError::EmailVerificationTokenInvalidOrNotFound)?;

    let session = ServerSession::unseal(&state.session_sealing_key, &session.sealed_session_data)?;
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
