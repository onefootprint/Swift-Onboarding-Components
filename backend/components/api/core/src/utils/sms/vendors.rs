use super::client::SmsClient;
use crate::FpResult;
use async_trait::async_trait;
use db::models::twilio_message_log::NewTwilioMessageLog;
use db::DbPool;
use newtypes::sms_message::SmsMessage;
use newtypes::PiiString;
use newtypes::TenantId;
use newtypes::VaultId;

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

#[derive(Debug)]
pub enum SmsSendStatus {
    /// The message was properly sent and is likely to be delivered
    Sent,
    /// The message was not properly sent. We should silently try sending with the next vendor
    Unsent,
}

#[async_trait]
pub trait SmsVendor: Send + Sync {
    /// Tries to send the provided message on the channel specified by the vendor.
    /// - Returns Ok(SmsSendStatus::Sent) if the message was successfully sent.
    /// - Returns Err(_) if there was an unrecoverable error delivering the message. We will return
    ///   the error to the client, but continue retrying on the next vendor
    /// - Returns Ok(SmsSendStatus::Unsent) if the message wasn't sent, but we should silently try
    ///   with the next vendor.
    async fn send(
        &self,
        client: &SmsClient,
        message: &SmsMessage,
        destination: &PiiString,
        t_id: Option<&TenantId>,
        v_id: Option<&VaultId>,
        db_pool: &DbPool,
    ) -> FpResult<SmsSendStatus>;
}

#[async_trait]
impl SmsVendor for TwilioSms {
    #[tracing::instrument("TwilioSms::send", skip_all)]
    async fn send(
        &self,
        client: &SmsClient,
        message: &SmsMessage,
        destination: &PiiString,
        t_id: Option<&TenantId>,
        v_id: Option<&VaultId>,
        db_pool: &DbPool,
    ) -> FpResult<SmsSendStatus> {
        let twilio_client = client.twilio_client(destination);
        let message = twilio_client.compose_sms_message(message, destination, t_id);
        let send_result = twilio_client.send(message).await.map(Box::new);

        match &send_result {
            Ok(msg)
            | Err(twilio::error::Error::DeliveryFailed(msg))
            | Err(twilio::error::Error::NotDeliveredAfterTimeout(msg)) => {
                let log = NewTwilioMessageLog {
                    message_id: msg.sid.clone(),
                    account_sid: twilio_client.account_sid().to_string(),
                    tenant_id: t_id.cloned(),
                    vault_id: v_id.cloned(),
                    status: msg.status.to_string().to_lowercase(),
                    error: msg.error_code.map(|e| e.to_string()),
                };
                db_pool.db_query(move |conn| log.update_or_create(conn)).await?;
            }
            _ => (),
        };

        send_result?;
        Ok(SmsSendStatus::Sent)
    }
}

#[async_trait]
impl SmsVendor for TwilioWhatsapp {
    #[tracing::instrument("TwilioWhatsapp::send", skip_all)]
    async fn send(
        &self,
        client: &SmsClient,
        message: &SmsMessage,
        destination: &PiiString,
        t_id: Option<&TenantId>,
        v_id: Option<&VaultId>,
        db_pool: &DbPool,
    ) -> FpResult<SmsSendStatus> {
        let twilio_client = client.twilio_client(destination);
        let message = twilio_client.compose_whatsapp_message(message, destination)?;
        let result = twilio_client.send(message).await;
        let result = match result {
            Ok(m) if m.status == twilio::response::message::Status::Sent => {
                // Special logic for WhatsApp - we want to consider Sent as a failure and fall back
                // to SMS, in case someone has a WhatsApp account but doesn't have the app installed
                return Err(twilio::error::Error::NotDeliveredAfterTimeout(Box::new(m)).into());
            }
            Err(e) if e.is_invalid_recipient_error() => {
                // Special logic for WhatsApp - if the recipient was invalid, we want to gracefully
                // fall back to SMS without returning the error to the client
                Ok(SmsSendStatus::Unsent)
            }
            Err(e) => Err(e.into()),
            Ok(message) => {
                let log = NewTwilioMessageLog {
                    message_id: message.sid,
                    account_sid: twilio_client.account_sid().to_string(),
                    tenant_id: t_id.cloned(),
                    vault_id: v_id.cloned(),
                    status: message.status.to_string().to_lowercase(),
                    error: message.error_message,
                };
                db_pool.db_query(move |conn| log.update_or_create(conn)).await?;
                Ok(SmsSendStatus::Sent)
            }
        };
        tracing::info!(result=?result.as_ref().ok(), err=?result.as_ref().err(), "WhatsApp message status");
        result
    }
}

#[async_trait]
impl SmsVendor for Pinpoint {
    #[tracing::instrument("Pinpoint::send", skip_all)]
    async fn send(
        &self,
        client: &SmsClient,
        message: &SmsMessage,
        destination: &PiiString,
        t_id: Option<&TenantId>,
        _v_id: Option<&VaultId>,
        _db_pool: &DbPool,
    ) -> FpResult<SmsSendStatus> {
        client
            .pinpoint_client
            .send_text_message()
            // TODO change number based on environment
            .origination_identity("+17655634600".to_owned())
            .destination_phone_number(destination.leak_to_string())
            .message_body(message.body(t_id).leak_to_string())
            .send()
            .await?;
        Ok(SmsSendStatus::Sent)
    }
}
