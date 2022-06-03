use aws_sdk_pinpointsmsvoicev2::output::SendTextMessageOutput;
use paperclip::actix::web;

use crate::{errors::ApiError, State};

pub(crate) async fn clean_phone_number(
    state: &web::Data<State>,
    raw_phone_number: &str,
) -> Result<String, ApiError> {
    let req = aws_sdk_pinpoint::model::NumberValidateRequest::builder()
        .phone_number(raw_phone_number)
        .build();
    let validated_phone_number = state
        .pinpoint_client
        .phone_number_validate()
        .number_validate_request(req)
        .send()
        .await?
        .number_validate_response
        .ok_or(ApiError::PhoneNumberValidationError)?
        .cleansed_phone_number_e164
        .ok_or(ApiError::PhoneNumberValidationError)?;
    Ok(validated_phone_number)
}

pub(crate) async fn send_sms(
    state: &web::Data<State>,
    destination_phone_number: String,
    message_body: String,
) -> Result<SendTextMessageOutput, ApiError> {
    let output = state
        .sms_client
        .send_text_message()
        .origination_identity("+17655634600".to_owned())
        .destination_phone_number(destination_phone_number.clone())
        .message_body(message_body)
        .send()
        .await?;
    Ok(output)
}
