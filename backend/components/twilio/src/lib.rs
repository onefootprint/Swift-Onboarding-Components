use crate::error::Error;
use crate::response::message::Status;
use hmac::Hmac;
use hmac::Mac;
use newtypes::sms_message::SmsMessage;
use newtypes::PiiString;
use newtypes::TenantId;
use newtypes::TwilioLookupField;
use rand::Rng;
use request::send_message::SendMessage;
use reqwest::IntoUrl;
use reqwest::Method;
use reqwest_middleware::ClientWithMiddleware;
use reqwest_middleware::RequestBuilder;
use reqwest_tracing::TracingMiddleware;
use response::decode_response;
use response::lookup::LookupResponse;
use response::message::Message;
use sha1::Sha1;
use std::time::Duration;

pub mod error;
pub mod request;
pub mod response;

use tokio_retry::strategy::FixedInterval;
use tokio_retry::Retry;

#[derive(Clone)]
pub struct TwilioConfig {
    pub account_sid: String,
    pub api_key: String,
    pub api_secret: String,
    pub auth_key_webhooks: String,
    pub from_number: String,
    pub whatsapp_sender_sid: String,
    pub whatsapp_otp_template_id: String,
    pub status_callback_url: Option<String>,
}

impl TwilioConfig {
    pub fn make_client(self) -> Option<Client> {
        let Self {
            account_sid,
            api_key,
            api_secret,
            auth_key_webhooks: _,
            from_number,
            whatsapp_sender_sid,
            whatsapp_otp_template_id,
            status_callback_url: _,
        } = &self;
        if account_sid.is_empty()
            || api_key.is_empty()
            || api_secret.is_empty()
            || from_number.is_empty()
            || whatsapp_sender_sid.is_empty()
            || whatsapp_otp_template_id.is_empty()
        {
            return None;
        }
        let client = Client::new(self);
        Some(client)
    }

    /// The environment-specific twilio content template ID for the provided SmsMessage kind,
    /// if there is one.
    pub fn whatsapp_content_sid(&self, message: &SmsMessage) -> Option<String> {
        match message {
            SmsMessage::Otp { .. } => Some(self.whatsapp_otp_template_id.clone()),
            _ => None,
        }
    }
}


#[derive(Clone)]
pub struct Client {
    config: TwilioConfig,
    client: ClientWithMiddleware,
}
impl Client {
    pub fn account_sid(&self) -> &str {
        &self.config.account_sid
    }

    pub fn webhook_signature(&self, payload: &str) -> Result<String, Error> {
        type HmacSha1 = Hmac<Sha1>;
        let mut mac = HmacSha1::new_from_slice(self.config.auth_key_webhooks.as_bytes())
            .map_err(|_| Error::InvalidWebhookAuthKey)?;
        mac.update(payload.as_bytes());
        let result = mac.finalize();
        let code_bytes = result.into_bytes();
        Ok(base64::encode(code_bytes))
    }
}

impl std::fmt::Debug for Client {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("twilio")
    }
}

impl Client {
    /// If a message wasnt delivered in 15s it should be useless to us, so tell twilio to drop it
    const VALIDITY_PERIOD_SECS: usize = 15;

    fn new(config: TwilioConfig) -> Self {
        let client = reqwest::Client::new();
        let client = reqwest_middleware::ClientBuilder::new(client)
            .with(TracingMiddleware::default())
            .build();

        Self { config, client }
    }

    fn request_builder<U: IntoUrl>(&self, method: Method, url: U) -> RequestBuilder {
        self
        .client
        .request(method, url)
        .timeout(Duration::from_secs(3)) // fail fast in 3sec
        .basic_auth(self.config.api_key.clone(), Some(self.config.api_secret.clone()))
    }

    /// validate a phone number against Twilio
    pub async fn validate_phone_number(&self, phone_number: &str) -> crate::response::Result<LookupResponse> {
        let url = format!("https://lookups.twilio.com/v1/PhoneNumbers/{phone_number}");

        let response = self.request_builder(Method::GET, url).send().await?;

        decode_response(response).await
    }

    /// lookup information on a phone number
    pub async fn lookup_v2(
        &self,
        phone_number: &str,
        fields: Vec<TwilioLookupField>,
    ) -> crate::response::Result<serde_json::Value> {
        let fields = fields.iter().map(|s| s.to_string()).collect::<Vec<_>>().join(",");

        let url = format!(
            "https://lookups.twilio.com/v2/PhoneNumbers/{phone_number}?Fields={}",
            fields
        );

        let response = self.request_builder(Method::GET, url).send().await?;

        let twilio_response = decode_response(response).await?;

        Ok(twilio_response)
    }

    pub fn compose_sms_message(
        &self,
        message: &SmsMessage,
        destination: &PiiString,
        t_id: Option<&TenantId>,
    ) -> SendMessage {
        // temporary workaround to support UK numbers with Alphanumeric Sender ID
        let from = if destination.leak().starts_with("+44") {
            "Footprint".to_string()
        } else {
            self.config.from_number.to_string()
        };
        SendMessage {
            body: Some(message.body(t_id).leak_to_string()),
            to: destination.leak_to_string(),
            from,
            validity_period: Self::VALIDITY_PERIOD_SECS as u64,
            // We only need to use these fields for whatsapp
            content_sid: None,
            content_variables: None,
            status_callback: self.config.status_callback_url.clone(),
        }
    }

    pub fn compose_whatsapp_message(
        &self,
        message: &SmsMessage,
        destination: &PiiString,
    ) -> crate::response::Result<SendMessage> {
        let from = self.config.whatsapp_sender_sid.clone();
        let to = format!("whatsapp:{}", destination.leak_to_string());
        let content_variables = message
            .whatsapp_content_variables()
            .map(|v| serde_json::ser::to_string(&v))
            .transpose()?;
        let message = SendMessage {
            to,
            from,
            validity_period: Self::VALIDITY_PERIOD_SECS as u64,
            content_sid: self.config.whatsapp_content_sid(message),
            content_variables,
            // body cannot be used in whatsapp messages, so we send the message using
            // content_sid and content_variables
            body: None,
            status_callback: self.config.status_callback_url.clone(),
        };
        Ok(message)
    }

    pub async fn send(&self, message: SendMessage) -> crate::response::Result<Message> {
        let account_sid = self.config.account_sid.clone();
        let url = format!("https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json");
        let response = self
            .request_builder(Method::POST, url)
            .form(&message)
            .send()
            .await?;

        let message: Message = decode_response(response).await?;
        let price = message.price.as_ref().map(|s| s.as_ref()).unwrap_or("null");
        tracing::info!(sid=%message.sid, status=%message.status, %price, "Sent twilio message");

        let result = if matches!(message.status, Status::Undelivered | Status::Failed) {
            // fatal delivery here, instantly abort
            Err(Error::DeliveryFailed(Box::new(message)))
        } else {
            // Wait for ~5s for the message to be delivered. If it doesn't deliver, error
            self.check_status(message.uri.clone()).await
        };
        match &result {
            Ok(message)
            | Err(Error::DeliveryFailed(message))
            | Err(Error::NotDeliveredAfterTimeout(message)) => {
                let price = message.price.as_ref().map(|s| s.as_ref()).unwrap_or("null");
                // Log for aggregate metrics on twilio performance
                tracing::info!(status=%message.status, %price, "Twilio SMS with status");
            }
            _ => (),
        }
        result.map(|m| *m)
    }

    async fn check_status(&self, message_uri: String) -> crate::response::Result<Box<Message>> {
        // We want to check every 500ms for 5s if there's been an error/success.
        let retry_strategy = FixedInterval::from_millis(500).map(jitter_10p).take(10);
        let result = Retry::spawn(retry_strategy, move || {
            self._check_status_inner(message_uri.clone())
        })
        .await;

        match result {
            // Determinate success
            Ok(Ok(message)) => Ok(Box::new(message)),
            // Determinate error encountered
            Ok(Err(e)) => Err(e),
            // We stayed in an indeterminate state for all attempts
            Err(message) => {
                if matches!(message.status, Status::Sent) {
                    // If the message is still in state Sent after 5s, don't error.
                    // This could still techncally transition to either Delivered or Undelivered,
                    // so it's indeterminate. But I figure it's unlikely retrying will get the
                    // result faster
                    Ok(Box::new(message))
                } else {
                    Err(Error::NotDeliveredAfterTimeout(Box::new(message)))
                }
            }
        }
    }

    /// Fetch the message from twilio.
    /// Returns Ok only when the result is determinate and we don't need to continue polling.
    /// Returns an Err if we want to retry and fetch again.
    async fn _check_status_inner(&self, message_uri: String) -> Result<Result<Message, Error>, Message> {
        let message = match self._get_message(message_uri).await {
            Ok(message) => message,
            // Terminal failure
            Err(err) => return Ok(Err(err)),
        };
        if matches!(message.status, Status::Undelivered | Status::Failed) {
            // Terminal failure status
            return Ok(Err(Error::DeliveryFailed(Box::new(message))));
        };
        if matches!(message.status, Status::Delivered | Status::Read) {
            // Terminal success status
            return Ok(Ok(message));
        }
        // Indeterminate result. Continue polling.
        // Sent can sometimes transition into Undelivered
        Err(message)
    }

    async fn _get_message(&self, message_uri: String) -> crate::response::Result<Message> {
        let url = format!("https://api.twilio.com{}", message_uri);
        let response = self.request_builder(Method::GET, url).send().await?;

        let message = decode_response(response).await?;
        Ok(message)
    }
}

/// Add jitter of +- 10%
pub fn jitter_10p(duration: Duration) -> Duration {
    let jitter = rand::thread_rng().gen_range(0.9..1.1);
    duration.mul_f64(jitter)
}
