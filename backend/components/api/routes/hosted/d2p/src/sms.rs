use crate::auth::user::UserAuthContext;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::{
    VaultWrapper,
    VwArgs,
};
use crate::State;
use api_core::auth::user::UserAuthScope;
use api_core::errors::user::UserError;
use api_core::types::ModernApiResult;
use api_core::utils::vault_wrapper::Person;
use api_core::ApiErrorKind;
use newtypes::sms_message::SmsMessage;
use newtypes::{
    ContactInfoKind,
    PhoneNumber,
    PiiString,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
    Apiv2Response,
    Apiv2Schema,
};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct D2pSmsRequest {
    url: PiiString,
}

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct D2pSmsResponse {
    time_before_retry_s: i64,
}

#[api_v2_operation(
    operation_id = "hosted-onboarding-d2p-sms",
    tags(D2p, Hosted),
    description = "Send an SMS with a link to the phone onboarding page."
)]
#[post("/hosted/onboarding/d2p/sms")]
pub async fn handler(
    user_auth: UserAuthContext,
    request: Json<D2pSmsRequest>,
    state: web::Data<State>,
) -> ModernApiResult<D2pSmsResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::Handoff)?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let id = user_auth.user_identifier();
            let args = VwArgs::from(&id);
            let uvw = VaultWrapper::<Person>::build(conn, args)?;
            Ok(uvw)
        })
        .await?;

    let (phone_number, ci, _) = uvw
        .decrypt_contact_info(&state, ContactInfoKind::Phone)
        .await?
        .ok_or(ApiErrorKind::ContactInfoKindNotInVault(ContactInfoKind::Phone))?;

    if !ci.is_otp_verified {
        // The d2p link we send out is authenticated as the user.
        // So, we want to make sure a tenant can't update the user's phone number/email
        // and then get an authenticated link. First, check that the phone number/email was
        // verified by the user.
        return Err(UserError::ContactInfoKindNotVerified(ContactInfoKind::Phone).into());
    }
    let phone_number = PhoneNumber::parse(phone_number)?;

    let message = SmsMessage::D2p {
        url: request.url.clone(),
    };
    state
        .sms_client
        .send_message(&state, message, phone_number)
        .await?;
    let time_before_retry_s = state.sms_client.duration_between_challenges;

    Ok(D2pSmsResponse {
        time_before_retry_s: time_before_retry_s.num_seconds(),
    })
}
