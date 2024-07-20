use crate::auth::session::AuthSessionData;
use crate::errors::challenge::ChallengeError;
use crate::utils::session::AuthSession;
use crate::State;
use api_core::types::ApiResponse;
use db::models::contact_info::ContactInfo;
use db::models::contact_info::VerificationLevel;
use newtypes::SessionAuthToken;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
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
) -> ApiResponse<api_wire_types::Empty> {
    // NOTE this is no longer used.
    // Check the context in https://github.com/onefootprint/monorepo/pull/10698
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
