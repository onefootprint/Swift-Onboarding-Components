use crate::errors::challenge::ChallengeError;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::{auth::session::AuthSessionData, utils::session::AuthSession};

use crate::errors::ApiError;
use crate::State;
use db::models::email::Email;
use newtypes::SessionAuthToken;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct EmailVerifyRequest {
    /// The token data in the email link fragment
    data: SessionAuthToken,
}

#[api_v2_operation(
    summary = "/hosted/user/email/verify",
    operation_id = "hosted-user-email-verify",
    tags(Hosted),
    description = "Used to asynchronously verify a user's email address. Requires the token sent \
    to the users email."
)]
#[post("/verify")]
async fn post(
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
        .db_query(move |conn| Email::mark_verified(conn, &data.email_id))
        .await??;

    Ok(Json(ResponseData::ok(EmptyResponse {})))
}
