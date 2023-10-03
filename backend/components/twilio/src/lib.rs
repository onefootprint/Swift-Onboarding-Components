use std::time::Duration;

use newtypes::PiiString;
use request::send_message::SendMessage;
use reqwest_tracing::TracingMiddleware;
use reqwest::{Method, IntoUrl};
use reqwest_middleware::ClientWithMiddleware;
use reqwest_middleware::RequestBuilder;
use response::{decode_response, lookup::LookupResponse, message::Message};

pub mod error;
pub mod request;
pub mod response;

use tokio_retry::strategy::FixedInterval;
use tokio_retry::strategy::{jitter, ExponentialBackoff};
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

        let response = self
            .request_builder(Method::GET, url)
            .send()
            .await?;

        decode_response(response).await
    }

    /// lookup information on a phone number
    pub async fn lookup_v2(&self, phone_number: &str) -> crate::response::Result<serde_json::Value> {
        let url = format!("https://lookups.twilio.com/v2/PhoneNumbers/{phone_number}?Fields=caller_name,sim_swap,call_forwarding,live_activity,line_type_intelligence");

        let response = self
            .request_builder(Method::GET, url)
            .send()
            .await?;

        let twilio_response = decode_response(response).await?;

        Ok(twilio_response)
    }

    /// send an sms message
    pub async fn send_message(&self, destination: PiiString, body: PiiString) -> crate::response::Result<Message> {
        let retry_strategy = ExponentialBackoff::from_millis(10)        
        .map(jitter) // add jitter
        .take(2); // limit to 2 retries

        let result = Retry::spawn(retry_strategy, move || {
            self.send_message_internal(destination.clone(), body.clone())
        })
        .await?;

        Ok(result)
    }

    async fn send_message_internal(
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
            validity_period: VALIDITY_PERIOD_SECS as u64 // dont send the message after TTL
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
        let message_uri = message.uri.clone();
        let retry_strategy = FixedInterval::from_millis(1000)
            .map(jitter)
            .take(5);
        Retry::spawn(retry_strategy, move || {
            self.check_status(message_uri.clone())
        })
        .await?;
        Ok(message)
    }

    async fn check_status(&self, message_uri: String) -> crate::response::Result<Message> {
        let url = format!("https://api.twilio.com{}", message_uri);

        let response = self
            .request_builder(Method::GET, url)
            .send()
            .await?;

        let message: Message = decode_response(response).await?;
        if matches!(message.status, Status::Undelivered | Status::Failed) {
            return Err(Error::DeliveryFailed(message.status, message.error_code));
        }
        if !matches!(message.status, Status::Delivered | Status::Sent) {
            return Err(Error::NotDelivered(message.status, message.error_code));
        }

        Ok(message)
    }
}
