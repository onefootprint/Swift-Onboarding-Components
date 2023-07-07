use newtypes::{
    vendor_credentials::IncodeCredentials, IncodeConfigurationId, IncodeSessionId, PiiJsonValue,
    ScrubbedPiiJsonValue,
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
}

impl<T: APIResponseToIncodeError + serde::Serialize> IncodeAPIResult<T> {
    pub fn into_success(self) -> Result<T, error::Error> {
        match self {
            IncodeAPIResult::Success(s) => Ok(s),
            IncodeAPIResult::ResponseError(e) => Err(error::Error::APIResponseError(e)),
        }
    }

    pub fn scrub(&self) -> Result<ScrubbedPiiJsonValue, error::Error> {
        let res = match self {
            IncodeAPIResult::Success(s) => ScrubbedPiiJsonValue::scrub(s),
            IncodeAPIResult::ResponseError(e) => ScrubbedPiiJsonValue::scrub(e),
        }?;

        Ok(res)
    }

    pub fn is_error(&self) -> bool {
        match self {
            IncodeAPIResult::Success(_) => false,
            IncodeAPIResult::ResponseError(_) => true,
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
