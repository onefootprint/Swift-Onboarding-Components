use super::client::SmsClient;
use crate::errors::ApiResult;
use async_trait::async_trait;
use newtypes::{sms_message::SmsMessage, PiiString};

pub struct TwilioSms;

pub struct TwilioWhatsapp;

pub struct Pinpoint;

#[derive(Eq, PartialEq, Clone, serde::Deserialize, strum::Display)]
pub enum SmsVendorKind {
    TwilioWhatsapp,
    TwilioSms,
    Pinpoint,
}

impl SmsVendorKind {
    pub fn vendor(&self) -> Box<dyn SmsVendor> {
        match self {
            Self::TwilioSms => Box::new(TwilioSms),
            Self::TwilioWhatsapp => Box::new(TwilioWhatsapp),
            Self::Pinpoint => Box::new(Pinpoint),
        }
    }

    pub fn default_vendors() -> Vec<Self> {
        vec![
            Self::TwilioWhatsapp,
            // We have TwilioSms twice because we want it to retry. But, we can't just build the
            // retries into the client because the SmsClient actually needs to know and orchestrate
            // each time a retry occurs
            Self::TwilioSms,
            Self::TwilioSms,
            Self::Pinpoint,
        ]
    }
}

#[async_trait]
pub trait SmsVendor: Send + Sync {
    async fn send(&self, client: &SmsClient, message: &SmsMessage, destination: &PiiString) -> ApiResult<()>;
}

#[async_trait]
impl SmsVendor for TwilioSms {
    #[tracing::instrument("Twilio::send", skip_all)]
    async fn send(&self, client: &SmsClient, message: &SmsMessage, destination: &PiiString) -> ApiResult<()> {
        let twilio_client = client.twilio_client(destination);
        let message = twilio_client.compose_sms_message(message, destination);
        twilio_client.send(message).await?;
        Ok(())
    }
}

#[async_trait]
impl SmsVendor for TwilioWhatsapp {
    #[tracing::instrument("Twilio::send", skip_all)]
    async fn send(&self, client: &SmsClient, message: &SmsMessage, destination: &PiiString) -> ApiResult<()> {
        let twilio_client = client.twilio_client(destination);
        let message = twilio_client.compose_whatsapp_message(message, destination)?;
        let message = twilio_client.send(message).await?;
        if message.status == twilio::response::message::Status::Sent {
            // Special logic for WhatsApp - we want to consider Sent as a failure and fall back to
            // SMS, in case someone has a WhatsApp account but doesn't have the app installed
            return Err(twilio::error::Error::NotDeliveredAfterTimeout(message.status, None).into());
        }
        Ok(())
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
}
