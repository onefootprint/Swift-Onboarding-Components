use std::time::Duration;

use newtypes::PiiString;
use request::send_message::SendMessage;
use reqwest::{IntoUrl, Method};
use reqwest_middleware::ClientWithMiddleware;
use reqwest_middleware::RequestBuilder;
use reqwest_tracing::TracingMiddleware;
use response::{decode_response, lookup::LookupResponse, message::Message};

pub mod error;
pub mod request;
pub mod response;

use tokio_retry::strategy::jitter;
use tokio_retry::strategy::FixedInterval;
use tokio_retry::Retry;

use crate::error::Error;
use crate::response::message::Status;

#[derive(Clone)]
pub struct Client {
    pub account_sid: String,
    pub from_number: String,
    api_key: String,
    api_secret: String,
    client: ClientWithMiddleware,
}

impl std::fmt::Debug for Client {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("twilio")
    }
}

impl Client {
    pub fn new(
        account_sid: String,
        api_key: String,
        api_secret: String,
        source_phone_number: String,
    ) -> Self {
        let client = reqwest::Client::new();
        let client = reqwest_middleware::ClientBuilder::new(client)
            .with(TracingMiddleware::default())
            .build();

        Self {
            account_sid,
            api_key,
            api_secret,
            from_number: source_phone_number,
            client,
        }
    }

    fn request_builder<U: IntoUrl>(&self, method: Method, url: U) -> RequestBuilder {
        self
        .client
        .request(method, url)
        .timeout(Duration::from_secs(3)) // fail fast in 3sec
        .basic_auth(self.api_key.clone(), Some(self.api_secret.clone()))
    }

    /// validate a phone number against Twilio
    pub async fn validate_phone_number(&self, phone_number: &str) -> crate::response::Result<LookupResponse> {
        let url = format!("https://lookups.twilio.com/v1/PhoneNumbers/{phone_number}");

        let response = self.request_builder(Method::GET, url).send().await?;

        decode_response(response).await
    }

    /// lookup information on a phone number
    pub async fn lookup_v2(&self, phone_number: &str) -> crate::response::Result<serde_json::Value> {
        let url = format!("https://lookups.twilio.com/v2/PhoneNumbers/{phone_number}?Fields=caller_name,sim_swap,call_forwarding,live_activity,line_type_intelligence");

        let response = self.request_builder(Method::GET, url).send().await?;

        let twilio_response = decode_response(response).await?;

        Ok(twilio_response)
    }

    pub async fn send_message(
        &self,
        destination: PiiString,
        body: PiiString,
    ) -> crate::response::Result<Message> {
        /// if a message wasnt delivered in 15s it should be useless to us
        /// so tell twilio to drop it
        const VALIDITY_PERIOD_SECS: usize = 15;

        let account_sid = self.account_sid.clone();
        let url = format!("https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json");

        let params = SendMessage {
            body: body.leak_to_string(),
            to: destination.leak_to_string(),
            from: self.from_number.to_string(),
            validity_period: VALIDITY_PERIOD_SECS as u64, // dont send the message after TTL
        };

        let response = self
            .request_builder(Method::POST, url)
            .form(&params)
            .send()
            .await?;

        let message: Message = decode_response(response).await?;

        // fatal delivery here, abort
        if matches!(message.status, Status::Undelivered | Status::Failed) {
            return Err(Error::DeliveryFailed(message.status, message.error_code));
        }

        // Wait for 5s for the message to be delivered. If it doesn't deliver, error
        self.check_status(message.uri.clone()).await?;
        Ok(message)
    }

    async fn check_status(&self, message_uri: String) -> crate::response::Result<Message> {
        // We want to check every 500ms for 5s if there's been an error/success.
        let retry_strategy = FixedInterval::from_millis(500).map(jitter).take(10);
        let result = Retry::spawn(retry_strategy, move || {
            self._check_status_inner(message_uri.clone())
        })
        .await;

        match result {
            // Determinate success
            Ok(Ok(message)) => Ok(message),
            // Determinate error encountered
            Ok(Err(e)) => Err(e),
            // We stayed in an indeterminate state for all attempts
            Err(message) => {
                if matches!(message.status, Status::Sent) {
                    // If the message is still in state Sent after 5s, don't error.
                    // This could still techncally transition to either Delivered or Undelivered,
                    // so it's indeterminate. But I figure it's unlikely retrying will get the
                    // result faster
                    Ok(message)
                } else {
                    Err(Error::NotDeliveredAfterTimeout(
                        message.status,
                        message.error_code,
                    ))
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
            // Determinate failure
            Err(err) => return Ok(Err(err)),
        };
        if matches!(message.status, Status::Undelivered | Status::Failed) {
            // Determinate failure
            return Ok(Err(Error::DeliveryFailed(message.status, message.error_code)));
        };
        if matches!(message.status, Status::Delivered) {
            // Determinate success
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
