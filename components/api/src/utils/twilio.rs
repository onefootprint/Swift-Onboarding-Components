use std::marker::PhantomData;

use crate::{errors::ApiError, identify::PhoneChallengeState};
use awc::Client;
use chrono::{Duration, Utc};
use crypto::{aead::ScopedSealingKey, b64::Base64Data, sha256};
use db::DbPool;
use newtypes::{PhoneNumber, ServerSession};

use super::challenge::{Challenge, ChallengeToken};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ValidatedPhoneNumber {
    pub e164: String,
    phantom: PhantomData<()>,
}

#[derive(Clone)]
pub struct TwilioClient {
    pub account_sid: String,
    pub api_key: String,
    pub api_secret: String,
    pub source_phone_number: String,
    pub time_s_between_challenges: i64,
    pub rp_id: String,
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
    prive_unit: Option<String>,
    sid: String,
    status: String,
    subresource_uris: Option<SubResourceUri>,
    to: String,
    uri: String,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
struct TwilioLookupResopnse {
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

impl TwilioClient {
    pub async fn standardize(
        &self,
        client: &Client,
        phone_number: PhoneNumber,
    ) -> Result<ValidatedPhoneNumber, ApiError> {
        let TwilioClient {
            account_sid: _,
            api_key,
            api_secret,
            source_phone_number: _,
            time_s_between_challenges: _,
            rp_id: _,
        } = self;
        let sanitized = phone_number.to_string();
        let url = format!("https://lookups.twilio.com/v1/PhoneNumbers/{sanitized}");

        let mut response = client
            .get(url)
            .basic_auth(api_key, api_secret)
            .send()
            .await
            .map_err(|err| ApiError::TwilioError(err.to_string()))?;

        let twilio_response = response
            .json::<TwilioResponse<TwilioLookupResopnse>>()
            .await
            .map_err(ApiError::DeserializationError)?;

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
        client: &Client,
        destination: ValidatedPhoneNumber,
        body: String,
    ) -> Result<TwilioMessageResponse, ApiError> {
        let TwilioClient {
            account_sid,
            api_key,
            api_secret,
            source_phone_number,
            time_s_between_challenges: _,
            rp_id: _,
        } = self;
        let url = format!("https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json");

        let params = [
            ("Body", body),
            ("To", destination.e164),
            ("From", source_phone_number.to_string()),
        ];

        let mut response = client
            .post(url)
            .basic_auth(api_key, api_secret)
            .send_form(&params)
            .await
            .map_err(|err| ApiError::TwilioError(err.to_string()))?;

        // let str = std::str::from_utf8(response.body().await?.as_ref())?.to_string();
        // log::error!("{:?}", str);

        let twilio_response = response
            .json::<TwilioResponse<TwilioMessageResponse>>()
            .await
            .map_err(ApiError::DeserializationError)?;

        match twilio_response {
            TwilioResponse::Success(resp) => Ok(resp),
            TwilioResponse::Error(e) => Err(ApiError::TwilioError(e.message)),
        }
    }

    pub async fn send_challenge(
        &self,
        client: &Client,
        db_pool: &DbPool,
        destination: ValidatedPhoneNumber,
        session_sealing_key: &ScopedSealingKey,
    ) -> Result<ChallengeToken, ApiError> {
        let code = crypto::random::gen_rand_n_digit_code(6);
        let message_body = format!("Your {} verification code is {}. Don't share your code with anyone. We will never contact you to request this code.", &self.rp_id, &code);

        self.rate_limit(db_pool, destination.clone(), "sms_challenge".to_string())
            .await?;

        self.send_message(client, destination.clone(), message_body)
            .await?;

        let challenge = Challenge {
            expires_at: Utc::now().naive_utc() + Duration::minutes(15),
            data: PhoneChallengeState {
                phone_number: destination,
                h_code: sha256(code.as_bytes()).to_vec(),
            },
        };
        let challenge_token = challenge.seal(session_sealing_key)?;
        Ok(challenge_token)
    }

    pub async fn send_d2p(
        &self,
        client: &Client,
        db_pool: &DbPool,
        destination: ValidatedPhoneNumber,
        base_url: String,
        auth_token: String,
    ) -> Result<(), ApiError> {
        let message_body = format!(
            "Hello from {}! Continue signing up for your account here: {}#{}",
            self.rp_id, base_url, auth_token
        );
        self.send_message(client, destination.clone(), message_body)
            .await?;

        self.rate_limit(db_pool, destination.clone(), "d2p_session".to_string())
            .await?;

        Ok(())
    }
    async fn rate_limit(
        &self,
        db_pool: &DbPool,
        phone_number: ValidatedPhoneNumber,
        scope: String,
    ) -> Result<(), ApiError> {
        let session_key =
            Base64Data(sha256(format!("{}:{}", phone_number.e164, scope).as_bytes()).to_vec()).to_string();
        let now = Utc::now().naive_utc();
        let time_between_challenges = Duration::seconds(self.time_s_between_challenges);

        let session = db::session::get_by_h_session_id(db_pool, session_key.clone()).await?;
        if let Some(ServerSession::ChallengeLastSent { sent_at }) = session.map(|s| s.session_data) {
            // TODO change name from ChallengeLastSent to something more generic for rate limiting
            let time_since_last_sent = now - sent_at;
            if time_since_last_sent < time_between_challenges {
                let time_remaining = (time_between_challenges - time_since_last_sent).num_seconds();
                return Err(ApiError::RateLimited(time_remaining));
            }
        }

        db::models::sessions::NewSession {
            h_session_id: session_key,
            session_data: ServerSession::ChallengeLastSent { sent_at: now },
            expires_at: now + time_between_challenges,
        }
        .update_or_create(db_pool)
        .await?;
        Ok(())
    }
}
