use super::client::SmsClient;
use crate::errors::ApiResult;
use async_trait::async_trait;
use crypto::sha256;
use feature_flag::{BoolFlag, FeatureFlagClient};
use newtypes::{sms_message::SmsMessage, Base64Data, PiiString};
use std::fmt::Debug;

#[derive(Debug, Eq, PartialEq)]
pub enum SmsVendorKind {
    Twilio,
    Pinpoint,
}

pub struct TwilioSms;

pub struct Pinpoint;

#[async_trait]
pub trait SmsVendor: Send + Sync {
    async fn send(&self, client: &SmsClient, message: &SmsMessage, destination: &PiiString) -> ApiResult<()>;
    fn vendor(&self) -> SmsVendorKind;
}

#[async_trait]
impl SmsVendor for TwilioSms {
    #[tracing::instrument("Twilio::send", skip_all)]
    async fn send(&self, client: &SmsClient, message: &SmsMessage, destination: &PiiString) -> ApiResult<()> {
        // Don't want to send raw phone number to twilio
        let h_destination =
            Base64Data::into_string_standard(sha256(destination.leak().as_bytes()).to_vec()).0;
        let flag = BoolFlag::UseBackupTwilioCredentials(&h_destination);
        let use_backup_twilio = client.ff_client.flag(flag);
        tracing::info!(%use_backup_twilio, %h_destination, has_backup=%client.twilio_client_backup.is_some(), "Choosing twilio client");
        let twilio_client = match (use_backup_twilio, client.twilio_client_backup.as_ref()) {
            (true, Some(backup_client)) => backup_client,
            _ => &client.twilio_client,
        };

        twilio_client
            .send_message(destination.clone(), message.clone())
            .await?;
        Ok(())
    }

    fn vendor(&self) -> SmsVendorKind {
        SmsVendorKind::Twilio
    }
}

#[async_trait]
impl SmsVendor for Pinpoint {
    #[tracing::instrument("Pinpoint::send", skip_all)]
    async fn send(&self, client: &SmsClient, message: &SmsMessage, destination: &PiiString) -> ApiResult<()> {
        client
            .pinpoint_client
            .send_text_message()
            // TODO change number based on environment
            .origination_identity("+17655634600".to_owned())
            .destination_phone_number(destination.leak_to_string())
            .message_body(message.body().leak_to_string())
            .send()
            .await?;
        Ok(())
    }

    fn vendor(&self) -> SmsVendorKind {
        SmsVendorKind::Pinpoint
    }
}
