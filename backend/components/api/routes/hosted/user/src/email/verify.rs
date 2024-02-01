use crate::{
    auth::session::AuthSessionData,
    errors::challenge::ChallengeError,
    types::{response::ResponseData, EmptyResponse},
    utils::session::AuthSession,
};

use crate::{errors::ApiError, State};
use db::models::contact_info::{ContactInfo, VerificationLevel};
use newtypes::SessionAuthToken;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct EmailVerifyRequest {
    /// The token data in the email link fragment
    data: SessionAuthToken,
}

#[api_v2_operation(
    tags(User, Hosted),
    description = "Used to asynchronously verify a user's email address. Requires the token sent \
    to the users email."
)]
#[actix::post("/hosted/user/email/verify")]
pub async fn post(
    state: web::Data<State>,
    request: Json<EmailVerifyRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let session = AuthSession::get(&state, &request.data).await?;

    let AuthSessionData::EmailVerify(data) = session.data else {
        return Err(ChallengeError::EmailVerificationTokenInvalid.into());
    };

    state
        .db_pool
        .db_query(move |conn| {
            ContactInfo::mark_verified(conn, &data.email_id, VerificationLevel::NonOtpVerified)
        })
        .await?;

    Ok(Json(ResponseData::ok(EmptyResponse {})))
}
