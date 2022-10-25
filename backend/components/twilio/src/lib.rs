use std::time::Duration;

use request::send_message::SendMessage;
use reqwest::{RequestBuilder, Method, IntoUrl};
use response::{decode_response, lookup::{LookupResponse}, message::Message};

pub mod error;
pub mod request;
pub mod response;

use tokio_retry::strategy::{jitter, ExponentialBackoff};
use tokio_retry::{Retry};

use crate::error::Error;
use crate::response::message::Status;

#[derive(Clone)]
pub struct Client {
    pub account_sid: String,
    pub from_number: String,
    api_key: String,
    api_secret: String,
    client: reqwest::Client,
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
    pub async fn send_message(&self, destination: &str, body: String) -> crate::response::Result<Message> {
        let retry_strategy = ExponentialBackoff::from_millis(10)        
        .map(jitter) // add jitter
        .take(3); // limit to 3 retries

        let result = Retry::spawn(retry_strategy, move || {
            self.send_message_internal(destination, body.clone())
        })
        .await?;

        Ok(result)
    }

    async fn send_message_internal(
        &self,
        destination: &str,
        body: String,
    ) -> crate::response::Result<Message> {
        /// if a message wasnt delivered in 15s it should be useless to us
        /// so tell twilio to drop it
        const VALIDITY_PERIOD_SECS:u64 = 15;

        let account_sid = self.account_sid.clone();
        let url = format!("https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json");

        let params = SendMessage {
            body,
            to: destination.to_owned(),
            from: self.from_number.to_string(),
            validity_period: VALIDITY_PERIOD_SECS // dont send the message after TTL
        };

        let response = self
            .request_builder(Method::POST, url)
            .form(&params)
            .send()
            .await?;

        let message: Message = decode_response(response).await?;

        // fatal delivery here, abort
        if matches!(message.status, Status::Undelivered | Status::Failed) {
            return Err(Error::DeliveryFailed)
        }

        Ok(message)
    }
}
