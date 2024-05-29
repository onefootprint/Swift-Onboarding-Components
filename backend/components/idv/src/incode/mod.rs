use self::request::OnboardingStartCustomNameFields;
use itertools::Either;
use newtypes::vendor_credentials::IncodeCredentials;
use newtypes::{
    IncodeConfigurationId,
    IncodeFailureReason,
    IncodeSessionId,
    PiiJsonValue,
    ScrubbedPiiJsonValue,
};
use serde::de::DeserializeOwned;

pub mod client;
pub mod curp_validation;
pub mod doc;
pub mod error;
pub mod government_validation;
pub mod request;
pub mod response;
pub mod watchlist;

pub struct IncodeStartOnboardingRequest {
    pub credentials: IncodeCredentials,
    pub configuration_id: IncodeConfigurationId,
    pub session_id: Option<IncodeSessionId>,
    pub custom_name_fields: Option<OnboardingStartCustomNameFields>,
}

/// Incode provides custom Error object when sending a 4xx. This trait is used to handle various
/// error cases for the various response structs
pub trait IncodeClientErrorCustomFailureReasons {
    fn custom_failure_reasons(error: response::Error) -> Option<Vec<IncodeFailureReason>>;
}

/// Struct representing a deserialized response that can include errors
pub struct IncodeResponse<T: IncodeClientErrorCustomFailureReasons + serde::Serialize> {
    pub result: IncodeAPIResult<T>,
    pub raw_response: PiiJsonValue,
}

impl<T: IncodeClientErrorCustomFailureReasons + serde::Serialize> IncodeResponse<T> {
    pub async fn from_response(response: reqwest::Response) -> Self
    where
        T: DeserializeOwned,
    {
        let (result, raw_response) = IncodeAPIResult::from_response(response).await;
        IncodeResponse {
            result,
            raw_response: raw_response.into(),
        }
    }

    pub fn from_value(value: serde_json::Value) -> Self
    where
        T: DeserializeOwned,
    {
        let result = match IncodeAPIResult::try_from(value.clone()) {
            Ok(api_result) => api_result,
            Err(e) => IncodeAPIResult::ResponseErrorUnhandled(e),
        };

        IncodeResponse {
            result,
            raw_response: value.into(),
        }
    }
}

pub enum IncodeAPIResult<T: IncodeClientErrorCustomFailureReasons> {
    // We successfully can deserialize a 200 response
    Success(T),
    // We got a 4xx, but we have informative error information we handle in code
    ResponseErrorHandled(response::Error),
    // We got a non-200 that didn't have handleable error information
    ResponseErrorUnhandled(error::Error),
}

impl<T: IncodeClientErrorCustomFailureReasons + serde::Serialize> IncodeAPIResult<T> {
    pub fn into_success(self) -> Result<T, error::Error> {
        match self {
            IncodeAPIResult::Success(s) => Ok(s),
            IncodeAPIResult::ResponseErrorHandled(e) => Err(error::Error::APIResponseError(e)),
            IncodeAPIResult::ResponseErrorUnhandled(e) => Err(e),
        }
    }

    pub fn safe_into_success(self) -> Either<T, Option<Vec<IncodeFailureReason>>> {
        match self.into_success() {
            Ok(s) => Either::Left(s),
            Err(error::Error::APIResponseError(e)) => Either::Right(T::custom_failure_reasons(e)),
            // TODO: handle this
            Err(_) => Either::Right(Some(vec![IncodeFailureReason::UnexpectedErrorOccurred])),
        }
    }

    pub fn scrub(&self) -> Result<ScrubbedPiiJsonValue, error::Error> {
        let res = match self {
            IncodeAPIResult::Success(s) => ScrubbedPiiJsonValue::scrub(s),
            IncodeAPIResult::ResponseErrorHandled(e) => ScrubbedPiiJsonValue::scrub(e),
            // If we have an unhandled error, there's no T to serialize
            IncodeAPIResult::ResponseErrorUnhandled(_) => ScrubbedPiiJsonValue::scrub(serde_json::json!({})),
        }?;

        Ok(res)
    }

    pub fn is_error(&self) -> bool {
        !matches!(self, IncodeAPIResult::Success(_))
    }
}

// TODO: remove
impl<T: DeserializeOwned + IncodeClientErrorCustomFailureReasons> TryFrom<serde_json::Value>
    for IncodeAPIResult<T>
{
    type Error = error::Error;

    fn try_from(response: serde_json::Value) -> Result<Self, Self::Error> {
        // first check if there's an error
        let error = deserialize_to_incode_custom_client_error(response.clone());
        match error {
            Ok(e) => Ok(IncodeAPIResult::<T>::ResponseErrorHandled(e)),
            Err(_) => {
                let raw: Result<T, _> = serde_json::from_value(response);
                match raw {
                    Ok(st) => Ok(IncodeAPIResult::Success(st)),
                    Err(e) => Ok(IncodeAPIResult::ResponseErrorUnhandled(e.into())),
                }
            }
        }
    }
}

pub fn deserialize_to_incode_custom_client_error(
    value: serde_json::Value,
) -> Result<crate::incode::response::Error, serde_json::Error> {
    serde_json::from_value::<crate::incode::response::Error>(value)
}

impl<T: IncodeClientErrorCustomFailureReasons> IncodeAPIResult<T> {
    pub async fn from_response(response: reqwest::Response) -> (IncodeAPIResult<T>, serde_json::Value)
    where
        T: DeserializeOwned + IncodeClientErrorCustomFailureReasons,
    {
        let (cl, http_status) = (response.content_length(), response.status());
        let response_json: Result<serde_json::Value, reqwest::Error> = response.json().await;
        match response_json {
            Ok(j) => {
                let result = if http_status.is_success() {
                    // TODO: there's a footgun here with incode in which for most of our response structs we
                    // only have optional fields. so if we get a response shape that is
                    // totally different than what we're expecting we'll get Ok(_) here,
                    // but it's actually not ok..
                    let raw: Result<T, serde_json::Error> = serde_json::from_value(j.clone());
                    match raw {
                        Ok(deser_json) => IncodeAPIResult::<T>::Success(deser_json),
                        Err(e) => {
                            tracing::error!(http_status=%http_status, content_length=?cl, error=?e, "error deserializing incode response");
                            IncodeAPIResult::<T>::ResponseErrorUnhandled(e.into())
                        }
                    }
                } else if http_status.is_client_error() {
                    // look for custom error codes
                    if let Ok(error) = deserialize_to_incode_custom_client_error(j.clone()) {
                        IncodeAPIResult::<T>::ResponseErrorHandled(error)
                    } else {
                        IncodeAPIResult::<T>::ResponseErrorUnhandled(error::Error::UnknownError)
                    }
                } else {
                    IncodeAPIResult::<T>::ResponseErrorUnhandled(error::Error::UnknownError)
                };

                (result, j)
            }
            // if we can't deserialize as json, we probably have a 5xx
            Err(err) => {
                tracing::error!(http_status=%http_status, content_length=?cl, ?err, "error parsing incode response as json");

                (
                    IncodeAPIResult::<T>::ResponseErrorUnhandled(err.into()),
                    serde_json::json!({}),
                )
            }
        }
    }
}
