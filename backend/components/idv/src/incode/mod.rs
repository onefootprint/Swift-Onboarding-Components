use itertools::Either;
use newtypes::{
    vendor_credentials::IncodeCredentials, IncodeConfigurationId, IncodeFailureReason, IncodeSessionId,
    PiiJsonValue, ScrubbedPiiJsonValue,
};
use serde::de::DeserializeOwned;

use self::request::OnboardingStartCustomNameFields;

pub mod client;
pub mod doc;
pub mod error;
pub mod request;
pub mod response;
pub mod watchlist;

pub struct IncodeStartOnboardingRequest {
    pub credentials: IncodeCredentials,
    pub configuration_id: IncodeConfigurationId,
    pub session_id: Option<IncodeSessionId>,
    pub custom_name_fields: Option<OnboardingStartCustomNameFields>,
}

/// Trait that an API Response uses to convert to an API error
/// response that is in the incode API response
pub trait APIResponseToIncodeError {
    fn to_error(&self) -> Option<response::Error>;
    fn custom_failure_reasons(error: response::Error) -> Option<Vec<IncodeFailureReason>>;
}

/// Struct representing a deserialized response that can include errors
#[derive(Clone)]
pub struct IncodeResponse<T: APIResponseToIncodeError + serde::Serialize> {
    pub result: IncodeAPIResult<T>,
    pub raw_response: PiiJsonValue,
}

#[derive(Clone)]
pub enum IncodeAPIResult<T: APIResponseToIncodeError> {
    Success(T),
    ResponseError(response::Error),
    ResponseErrorOther(String),
}

impl<T: APIResponseToIncodeError + serde::Serialize> IncodeAPIResult<T> {
    pub fn into_success(self) -> Result<T, error::Error> {
        match self {
            IncodeAPIResult::Success(s) => Ok(s),
            IncodeAPIResult::ResponseError(e) => Err(error::Error::APIResponseError(e)),
            IncodeAPIResult::ResponseErrorOther(s) => Err(error::Error::SendError(s)),
        }
    }

    pub fn safe_into_success(self) -> Either<T, Option<Vec<IncodeFailureReason>>> {
        match self.into_success() {
            Ok(s) => Either::Left(s),
            Err(error::Error::APIResponseError(e)) => Either::Right(T::custom_failure_reasons(e)),
            Err(_) => Either::Right(Some(vec![IncodeFailureReason::UnexpectedErrorOccurred])),
        }
    }

    pub fn scrub(&self) -> Result<ScrubbedPiiJsonValue, error::Error> {
        let res = match self {
            IncodeAPIResult::Success(s) => ScrubbedPiiJsonValue::scrub(s),
            IncodeAPIResult::ResponseError(e) => ScrubbedPiiJsonValue::scrub(e),
            IncodeAPIResult::ResponseErrorOther(s) => ScrubbedPiiJsonValue::scrub(s),
        }?;

        Ok(res)
    }

    pub fn is_error(&self) -> bool {
        match self {
            IncodeAPIResult::Success(_) => false,
            IncodeAPIResult::ResponseError(_) => true,
            IncodeAPIResult::ResponseErrorOther(_) => true,
        }
    }
}

impl<T: DeserializeOwned + APIResponseToIncodeError> TryFrom<serde_json::Value> for IncodeAPIResult<T> {
    type Error = error::Error;

    fn try_from(response: serde_json::Value) -> Result<Self, Self::Error> {
        let raw: T = serde_json::from_value(response)?;
        if let Some(error) = raw.to_error() {
            Ok(IncodeAPIResult::<T>::ResponseError(error))
        } else {
            Ok(IncodeAPIResult::<T>::Success(raw))
        }
    }
}

pub async fn from_response<T>(response: reqwest::Response) -> IncodeAPIResult<T>
where
    T: DeserializeOwned + APIResponseToIncodeError,
{
    let (cl, s) = (response.content_length(), response.status());
    let response_json: Result<serde_json::Value, reqwest::Error> = response.json().await;
    match response_json {
        Ok(j) => {
            let raw: Result<T, serde_json::Error> = serde_json::from_value(j.clone());
            match raw {
                Ok(deser_json) => {
                    // If request was successful and we deserialized
                    // TODO: all options so what to do here...
                    if s.is_success() {
                        IncodeAPIResult::<T>::Success(deser_json)
                    // 4xx
                    } else if s.is_client_error() {
                        // look for custom error codes
                        if let Some(error) = deser_json.to_error() {
                            IncodeAPIResult::<T>::ResponseError(error)
                        // otherwise, we just return whatever the body has as an error
                        } else {
                            IncodeAPIResult::<T>::ResponseErrorOther(j.to_string())
                        }
                    // if we are is non-2xx/4xx
                    // we should have retried in reqwest middleware already, 5xx w/ a body is weird, but for completeness
                    } else {
                        IncodeAPIResult::<T>::ResponseErrorOther(j.to_string())
                    }
                }
                // if we had issues deserializing something is up
                Err(e) => {
                    tracing::error!(http_status=%s, content_length=?cl, error=?e, "error deserializing incode response");
                    IncodeAPIResult::<T>::ResponseErrorOther(e.to_string())
                }
            }
        }
        // if we can't deserialize as json, we probably have a 5xx
        Err(err) => {
            tracing::error!(http_status=%s, content_length=?cl, ?err, "error parsing incode response as json");

            IncodeAPIResult::<T>::ResponseErrorOther(err.to_string())
        }
    }
}
