use std::fmt::Debug;

use crate::{errors::ApiError, identify::PhoneChallengeState, State};
use chrono::{Duration, Utc};
use crypto::sha256;
use newtypes::{PhoneNumber, PiiString, SessionAuthToken, ValidatedPhoneNumber};
use serde::Serialize;

use super::session::RateLimitSession;

pub type SecondsBeforeRetry = i64;

pub const D2P_LINK: &str = "d2p_session";
pub const SMS_CHALLENGE: &str = "sms_challenge";

#[derive(Clone)]
pub struct TwilioClient {
    pub account_sid: String,
    pub source_phone_number: String,
    pub time_s_between_challenges: i64,
    pub rp_id: String,
    api_key: String,
    api_secret: String,
    client: reqwest::Client,
}

impl std::fmt::Debug for TwilioClient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("twilio")
    }
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
struct TwilioMessageResponse {
    account_sid: String,
    date_created: String,
    date_updated: String,
    date_sent: Option<String>,
    api_version: String,
    body: String,
    direction: String,
    error_code: Option<String>,
    error_message: Option<String>,
    from: String,
    messaging_service_sid: Option<String>,
    num_media: String,
    num_segments: String,
    price: Option<String>,
    price_unit: Option<String>,
    sid: String,
    status: String,
    subresource_uris: Option<SubResourceUri>,
    to: String,
    uri: String,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
struct TwilioLookupResponse {
    caller_name: Option<String>,
    carrier: Option<TwilioCarrierInformation>,
    country_code: String,
    national_format: String,
    phone_number: String,
    add_ons: Option<String>,
    url: String,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
struct TwilioCarrierInformation {
    error_code: Option<String>,
    mobile_country_code: Option<String>,
    mobile_network_code: Option<String>,
    name: Option<String>,
    type_: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
struct TwilioError {
    code: i64,
    message: String,
    more_info: String,
    status: i64,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
struct SubResourceUri {
    media: String,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(untagged)]
enum TwilioResponse<T> {
    Success(T),
    Error(TwilioError),
}

impl TwilioClient {
    pub fn new(
        account_sid: String,
        api_key: String,
        api_secret: String,
        source_phone_number: String,
        time_s_between_challenges: i64,
        rp_id: String,
    ) -> Self {
        let client = reqwest::Client::new();
        Self {
            account_sid,
            api_key,
            api_secret,
            source_phone_number,
            time_s_between_challenges,
            rp_id,
            client,
        }
    }

    pub async fn standardize(&self, phone_number: &PhoneNumber) -> Result<ValidatedPhoneNumber, ApiError> {
        let url = format!(
            "https://lookups.twilio.com/v1/PhoneNumbers/{}",
            phone_number.leak()
        );

        let response = self
            .client
            .get(url)
            .basic_auth(self.api_key.clone(), Some(self.api_secret.clone()))
            .send()
            .await
            .map_err(|err| ApiError::TwilioError(err.to_string()))?;

        let twilio_response = response.json::<TwilioResponse<TwilioLookupResponse>>().await?;

        let (e164, country_code) = match twilio_response {
            TwilioResponse::Success(resp) => Ok((resp.phone_number, resp.country_code)),
            TwilioResponse::Error(e) => Err(ApiError::TwilioError(e.message)),
        }?;

        Ok(ValidatedPhoneNumber::__build(
            e164,
            country_code,
            phone_number.suffix.clone(),
        ))
    }

    async fn send_message(
        &self,
        destination: &ValidatedPhoneNumber,
        body: String,
    ) -> Result<TwilioMessageResponse, ApiError> {
        let account_sid = self.account_sid.clone();
        let url = format!("https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json");

        #[derive(Serialize)]
        #[serde(rename_all = "PascalCase")]
        struct SendForm<'a> {
            body: String,
            to: &'a PiiString,
            from: String,
        }
        let params = SendForm {
            body,
            to: &destination.e164,
            from: self.source_phone_number.to_string(),
        };

        let response = self
            .client
            .post(url)
            .basic_auth(self.api_key.clone(), Some(self.api_secret.clone()))
            .form(&params)
            .send()
            .await
            .map_err(|err| ApiError::TwilioError(err.to_string()))?;

        let twilio_response = response.json::<TwilioResponse<TwilioMessageResponse>>().await?;

        match twilio_response {
            TwilioResponse::Success(resp) => Ok(resp),
            TwilioResponse::Error(e) => Err(ApiError::TwilioError(e.message)),
        }
    }

    pub async fn send_challenge(
        &self,
        state: &State,
        destination: &ValidatedPhoneNumber,
    ) -> Result<(PhoneChallengeState, SecondsBeforeRetry), ApiError> {
        let code = crypto::random::gen_rand_n_digit_code(6);
        let message_body = format!("Your {} verification code is {}. Don't share your code with anyone. We will never contact you to request this code.", &self.rp_id, &code);

        let time_before_retry_s = self.rate_limit(state, destination, SMS_CHALLENGE).await?;

        self.send_message(destination, message_body).await?;

        Ok((
            PhoneChallengeState {
                phone_number: destination.clone(),
                h_code: sha256(code.as_bytes()).to_vec(),
            },
            time_before_retry_s,
        ))
    }

    pub async fn send_d2p(
        &self,
        state: &State,
        destination: &ValidatedPhoneNumber,
        base_url: String,
        auth_token: SessionAuthToken,
    ) -> Result<SecondsBeforeRetry, ApiError> {
        let time_before_retry_s = self.rate_limit(state, destination, D2P_LINK).await?;

        let message_body = format!(
            "Hello from {}! Continue signing up for your account here: {}#{}",
            self.rp_id, base_url, auth_token
        );
        self.send_message(destination, message_body).await?;

        Ok(time_before_retry_s)
    }

    async fn rate_limit(
        &self,
        state: &State,
        phone_number: &ValidatedPhoneNumber,
        scope: &str,
    ) -> Result<SecondsBeforeRetry, ApiError> {
        let rate_limit_key = format!("{}:{}", phone_number.e164.leak(), scope);

        let now = Utc::now();
        let time_between_challenges_s = self.time_s_between_challenges;
        let duration_between_challenges = Duration::seconds(time_between_challenges_s);

        if let Some(session) = RateLimitSession::get(state, &rate_limit_key).await? {
            let time_since_last_sent = now - session.data.sent_at;
            if time_since_last_sent < duration_between_challenges {
                let time_remaining = (duration_between_challenges - time_since_last_sent).num_seconds();
                return Err(ApiError::RateLimited(time_remaining));
            }
        }

        RateLimitSession::update_or_create(state, &rate_limit_key, now, now + duration_between_challenges)
            .await?;
        Ok(time_between_challenges_s)
    }
}
