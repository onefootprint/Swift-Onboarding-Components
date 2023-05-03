use newtypes::{
    vendor_credentials::{IncodeCredentials, IncodeCredentialsWithToken},
    DocVData, IncodeConfigurationId, IncodeSessionId,
};
use serde::de::DeserializeOwned;

pub mod client;
pub mod error;
pub mod request;
pub mod response;

pub struct IncodeStartOnboardingRequest {
    pub credentials: IncodeCredentials,
    pub configuration_id: IncodeConfigurationId,
    pub session_id: Option<IncodeSessionId>,
}

pub struct IncodeAddFrontRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub docv_data: DocVData,
}
pub struct IncodeAddBackRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub docv_data: DocVData,
}

pub struct IncodeProcessIdRequest {
    pub credentials: IncodeCredentialsWithToken,
}

pub struct IncodeFetchScoresRequest {
    pub credentials: IncodeCredentialsWithToken,
}

/// Trait that an API Response uses to convert to an API error
/// response that is in the incode API response
pub trait APIResponseToIncodeError {
    fn to_error(&self) -> Option<response::Error>;
}

/// Struct representing a deserialized response that can include errors
pub struct IncodeResponse<T: APIResponseToIncodeError> {
    pub result: IncodeAPIResult<T>,
    pub raw_response: serde_json::Value,
}

pub enum IncodeAPIResult<T: APIResponseToIncodeError> {
    Success(T),
    ResponseError(response::Error),
}

impl<T: APIResponseToIncodeError> IncodeAPIResult<T> {
    pub fn into_success(self) -> Result<T, error::Error> {
        match self {
            IncodeAPIResult::Success(s) => Ok(s),
            IncodeAPIResult::ResponseError(e) => Err(error::Error::APIResponseError(e)),
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
