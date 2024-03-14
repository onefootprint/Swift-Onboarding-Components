use super::client::SmsClient;
use crate::errors::ApiResult;
use async_trait::async_trait;
use crypto::sha256;
use feature_flag::{BoolFlag, FeatureFlagClient};
use newtypes::{Base64Data, PiiString};
use std::fmt::Debug;

#[derive(Debug, Eq, PartialEq)]
pub enum SmsVendorKind {
    Twilio,
    Pinpoint,
}

#[derive(Clone, Copy)]
pub struct Message<'a> {
    pub message: &'a PiiString,
    pub destination: &'a PiiString,
    pub client: &'a SmsClient,
}

#[derive(derive_more::Deref)]
pub struct Twilio<'a>(#[deref] pub Message<'a>);

#[derive(derive_more::Deref)]
pub struct Pinpoint<'a>(#[deref] pub Message<'a>);

#[async_trait]
pub trait SmsVendor: Send + Sync {
    async fn send(&self) -> ApiResult<()>;
    fn vendor(&self) -> SmsVendorKind;
}

#[async_trait]
impl<'a> SmsVendor for Twilio<'a> {
    #[tracing::instrument("Twilio::send", skip_all)]
    async fn send(&self) -> ApiResult<()> {
        // Don't want to send raw phone number to twilio
        let h_destination =
            Base64Data::into_string_standard(sha256(self.destination.leak().as_bytes()).to_vec()).0;
        let flag = BoolFlag::UseBackupTwilioCredentials(&h_destination);
        let use_backup_twilio = self.client.ff_client.flag(flag);
        tracing::info!(%use_backup_twilio, %h_destination, has_backup=%self.client.twilio_client_backup.is_some(), "Choosing twilio client");
        let twilio_client = match (use_backup_twilio, self.client.twilio_client_backup.as_ref()) {
            (true, Some(backup_client)) => backup_client,
            _ => &self.client.twilio_client,
        };

        twilio_client
            .send_message(self.destination.clone(), self.message.clone())
            .await?;
        Ok(())
    }

    fn vendor(&self) -> SmsVendorKind {
        SmsVendorKind::Twilio
    }
}

#[async_trait]
impl<'a> SmsVendor for Pinpoint<'a> {
    #[tracing::instrument("Pinpoint::send", skip_all)]
    async fn send(&self) -> ApiResult<()> {
        self
            .0
            .client
            .pinpoint_client
            .send_text_message()
            // TODO change number based on environment
            .origination_identity("+17655634600".to_owned())
            .destination_phone_number(self.destination.leak_to_string())
            .message_body(self.message.leak_to_string())
            .send()
            .await?;
        Ok(())
    }

    fn vendor(&self) -> SmsVendorKind {
        SmsVendorKind::Pinpoint
    }
}
