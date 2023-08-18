use std::collections::HashMap;

use newtypes::PiiString;

use crate::{
    errors::{user::UserError, ApiResult},
    State,
};

use super::vault_wrapper::VaultWrapper;

pub struct SmsMessage<'a> {
    pub message_body: PiiString,
    pub rate_limit_scope: &'a str,
}

pub struct EmailMessage<'a> {
    pub template_id: &'a str,
    pub template_data: HashMap<String, PiiString>,
}

pub async fn send_to_primary_verified_contact_info<'a, S, E>(
    state: &State,
    vw: &VaultWrapper,
    sms_message: S,
    email_message: E,
) -> ApiResult<()>
where
    S: Into<SmsMessage<'a>>,
    E: Into<EmailMessage<'a>>,
{
    // TODO: better vw utils so we dont .ok() errors here
    let phone = vw.get_decrypted_verified_primary_phone(state).await.ok();
    let email = vw.get_decrypted_verified_email(state).await.ok();
    // prefer phone over email
    if let Some(phone) = phone {
        let sms_message = sms_message.into();
        state
            .twilio_client
            .send_message(
                state,
                sms_message.message_body,
                &phone,
                sms_message.rate_limit_scope,
            )
            .await
    } else if let Some(email) = email {
        let email_message = email_message.into();
        state
            .sendgrid_client
            .send_template(
                email.email,
                email_message.template_id,
                email_message.template_data,
            )
            .await
    } else {
        Err(UserError::NoVerifiedContactInfoForUser.into())
    }
}
