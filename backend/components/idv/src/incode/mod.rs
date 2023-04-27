use serde::de::DeserializeOwned;

pub mod client;
pub mod error;
pub mod request;
pub mod response;

/// Trait that an API Response uses to convert to an API error
/// response that is in the incode API response
pub trait APIResponseToIncodeError {
    fn to_error(&self) -> Option<response::Error>;
}

/// Struct representing a deserialized response that can include errors
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
