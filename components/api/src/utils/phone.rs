use aws_sdk_pinpointsmsvoicev2::output::SendTextMessageOutput;
use chrono::{Duration, Utc};
use crypto::{b64::Base64Data, sha256};
use db::models::session_data::{ChallengeLastSentData, SessionState};
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

pub(crate) async fn rate_limit(
    state: &web::Data<State>,
    phone_number: String,
    scope: &'static str,
) -> Result<(), ApiError> {
    let session_key =
        Base64Data(sha256(format!("{}:{}", phone_number, scope).as_bytes()).to_vec()).to_string();
    let now = Utc::now().naive_utc();
    let time_between_challenges = Duration::seconds(state.config.time_s_between_sms_challenges);

    let session = db::session::get_by_h_session_id(&state.db_pool, session_key.clone()).await?;
    if let Some(SessionState::ChallengeLastSent(data)) = session.map(|s| s.session_data) {
        // TODO change name from ChallengeLastSent to something more generic for rate limiting
        let time_since_last_sent = now - data.sent_at;
        if time_since_last_sent < time_between_challenges {
            let time_remaining = (time_between_challenges - time_since_last_sent).num_seconds();
            return Err(ApiError::RateLimited(time_remaining));
        }
    }

    db::models::sessions::NewSession {
        h_session_id: session_key,
        session_data: SessionState::ChallengeLastSent(ChallengeLastSentData { sent_at: now }),
        expires_at: now + time_between_challenges,
    }
    .update_or_create(&state.db_pool)
    .await?;
    Ok(())
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
