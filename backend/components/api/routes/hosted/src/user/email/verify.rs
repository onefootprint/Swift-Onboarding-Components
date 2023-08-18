use crate::errors::challenge::ChallengeError;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::{auth::session::AuthSessionData, utils::session::AuthSession};

use crate::errors::ApiError;
use crate::State;
use db::models::contact_info::{ContactInfo, VerificationLevel};
use newtypes::SessionAuthToken;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct EmailVerifyRequest {
    /// The token data in the email link fragment
    data: SessionAuthToken,
}

#[api_v2_operation(
    tags(Hosted),
    description = "Used to asynchronously verify a user's email address. Requires the token sent \
    to the users email."
)]
#[actix::post("/hosted/user/email/verify")]
pub async fn post(
    state: web::Data<State>,
    request: Json<EmailVerifyRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let session = AuthSession::get(&state, &request.data)
        .await?
        .ok_or(ChallengeError::EmailVerificationTokenInvalidOrNotFound)?;

    let data = if let AuthSessionData::EmailVerify(data) = session.data {
        Ok(data)
    } else {
        Err(ApiError::from(
            ChallengeError::EmailVerificationTokenInvalidOrNotFound,
        ))
    }?;

    state
        .db_pool
        .db_query(move |conn| {
            ContactInfo::mark_verified(conn, &data.email_id, VerificationLevel::NonOtpVerified)
        })
        .await??;

    Ok(Json(ResponseData::ok(EmptyResponse {})))
}
