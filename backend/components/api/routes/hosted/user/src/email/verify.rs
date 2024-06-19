use crate::auth::session::AuthSessionData;
use crate::errors::challenge::ChallengeError;
use crate::utils::session::AuthSession;
use crate::State;
use api_core::types::JsonApiResponse;
use db::models::contact_info::{
    ContactInfo,
    VerificationLevel,
};
use newtypes::SessionAuthToken;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
    Apiv2Schema,
};

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
) -> JsonApiResponse<api_wire_types::Empty> {
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

    Ok(api_wire_types::Empty)
}
