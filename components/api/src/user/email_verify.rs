use crate::auth::session_data::SessionData;
use crate::errors::challenge::ChallengeError;
use crate::types::success::ApiResponseData;

use crate::State;
use crate::{auth::session_data::ServerSession, errors::ApiError};
use chrono::Utc;
use newtypes::{DataKind, SessionAuthToken};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct EmailVerifyRequest {
    /// The token data in the email link fragment
    data: SessionAuthToken,
}

#[api_v2_operation(tags(User))]
#[post("/email/verify")]
/// Used to asynchronously verify a user's email address.
/// Requires the token sent to the users email
async fn handler(
    state: web::Data<State>,
    request: Json<EmailVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    let session = db::session::get_session_by_auth_token(&state.db_pool, request.into_inner().data)
        .await?
        .ok_or(ChallengeError::EmailVerificationTokenInvalidOrNotFound)?;

    let session = ServerSession::unseal(&state.session_sealing_key, &session.sealed_session_data)?;

    let data = if let SessionData::EmailVerify(data) = session.data {
        Ok(data)
    } else {
        Err(ApiError::from(
            ChallengeError::EmailVerificationTokenInvalidOrNotFound,
        ))
    }?;

    // Challenge is tied to a user vault to ensure that if multiple users have registered
    // the same email but not verified it, we mark the correct one as verified
    let (_, email_user_data) = db::user_vault::get_by_fingerprint_and_uv_id(
        &state.db_pool,
        DataKind::Email,
        data.uv_id,
        data.sh_email,
        false,
    )
    .await?
    .ok_or(ChallengeError::UserDoesntExistForEmailChallenge)?;

    if session.expires_at < Utc::now() {
        return Err(ChallengeError::EmailChallengeExpired.into());
    }

    // Challenge is valid, let's mark the email as valid in user vault
    email_user_data.mark_verified(&state.db_pool).await?;

    Ok(Json(ApiResponseData {
        data: "updated successfully".to_owned(),
    }))
}
