use std::{fmt::Debug, marker::PhantomData};

use crate::{errors::ApiError, identify::PhoneChallengeState, State};
use chrono::{Duration, Utc};
use crypto::sha256;
use newtypes::{Base64Data, PhoneNumber, SealedSessionBytes, SessionAuthToken};

use self::rate_limit::RateLimitRecord;

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct ValidatedPhoneNumber {
    pub e164: String,
    phantom: PhantomData<()>,
}

impl Debug for ValidatedPhoneNumber {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let skip = self.e164.len() - 2;

        let out = format!(
            "{}{}",
            "*".repeat(skip),
            self.e164.chars().skip(skip).collect::<String>()
        );
        out.fmt(f)
    }
}

impl AsRef<[u8]> for ValidatedPhoneNumber {
    fn as_ref(&self) -> &[u8] {
        self.e164.as_bytes()
    }
}

impl AsRef<str> for ValidatedPhoneNumber {
    fn as_ref(&self) -> &str {
        self.e164.as_str()
    }
}

impl ValidatedPhoneNumber {
    /// escape hatch for constructing a known validated phone number
    pub fn unvalidated(e164: String) -> Self {
        Self {
            e164,
            phantom: PhantomData,
        }
    }
}
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
    country_code: Option<String>,
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

mod rate_limit {
    pub const D2P_LINK: &str = "d2p_session";
    pub const SMS_CHALLENGE: &str = "sms_challenge";

    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    pub struct RateLimitRecord {
        pub sent_at: chrono::NaiveDateTime,
    }
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
        let sanitized = phone_number.clone().leak_to_string();
        let url = format!("https://lookups.twilio.com/v1/PhoneNumbers/{sanitized}");

        let response = self
            .client
            .get(url)
            .basic_auth(self.api_key.clone(), Some(self.api_secret.clone()))
            .send()
            .await
            .map_err(|err| ApiError::TwilioError(err.to_string()))?;

        let twilio_response = response.json::<TwilioResponse<TwilioLookupResponse>>().await?;

        let e164 = match twilio_response {
            TwilioResponse::Success(resp) => Ok(resp.phone_number),
            TwilioResponse::Error(e) => Err(ApiError::TwilioError(e.message)),
        }?;

        Ok(ValidatedPhoneNumber {
            e164,
            phantom: PhantomData,
        })
    }

    async fn send_message(
        &self,
        destination: ValidatedPhoneNumber,
        body: String,
    ) -> Result<TwilioMessageResponse, ApiError> {
        let account_sid = self.account_sid.clone();
        let url = format!("https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json");

        let params = [
            ("Body", body),
            ("To", destination.e164),
            ("From", self.source_phone_number.to_string()),
        ];

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
        destination: ValidatedPhoneNumber,
    ) -> Result<PhoneChallengeState, ApiError> {
        let code = crypto::random::gen_rand_n_digit_code(6);
        let message_body = format!("Your {} verification code is {}. Don't share your code with anyone. We will never contact you to request this code.", &self.rp_id, &code);

        self.rate_limit(state, destination.clone(), rate_limit::SMS_CHALLENGE)
            .await?;

        self.send_message(destination.clone(), message_body).await?;

        Ok(PhoneChallengeState {
            phone_number: destination,
            h_code: sha256(code.as_bytes()).to_vec(),
        })
    }

    pub async fn send_d2p(
        &self,
        state: &State,
        destination: ValidatedPhoneNumber,
        base_url: String,
        auth_token: SessionAuthToken,
    ) -> Result<(), ApiError> {
        self.rate_limit(state, destination.clone(), rate_limit::D2P_LINK)
            .await?;

        let message_body = format!(
            "Hello from {}! Continue signing up for your account here: {}#{}",
            self.rp_id, base_url, auth_token
        );
        self.send_message(destination.clone(), message_body).await?;

        Ok(())
    }

    async fn rate_limit(
        &self,
        state: &State,
        phone_number: ValidatedPhoneNumber,
        scope: &str,
    ) -> Result<(), ApiError> {
        let h_session_id =
            Base64Data(sha256(format!("{}:{}", phone_number.e164, scope).as_bytes()).to_vec()).to_string();

        let now = Utc::now().naive_utc();
        let time_between_challenges = Duration::seconds(self.time_s_between_challenges);

        if let Some(session) =
            db::session::get_session_by_primary_key(&state.db_pool, h_session_id.clone()).await?
        {
            if let Ok(RateLimitRecord { sent_at }) =
                serde_json::from_slice(session.sealed_session_data.as_ref())
            {
                let time_since_last_sent = now - sent_at;
                if time_since_last_sent < time_between_challenges {
                    let time_remaining = (time_between_challenges - time_since_last_sent).num_seconds();
                    return Err(ApiError::RateLimited(time_remaining));
                }
            }
        }

        db::models::sessions::NewSession {
            h_session_id,
            sealed_session_data: SealedSessionBytes(serde_json::to_vec(&RateLimitRecord { sent_at: now })?),
            expires_at: now + time_between_challenges,
        }
        .update_or_create(&state.db_pool)
        .await?;
        Ok(())
    }
}
