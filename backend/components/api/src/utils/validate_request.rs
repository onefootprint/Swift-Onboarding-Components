//! Helper trait for validating params in a Request

use crate::errors::ApiError;

pub trait ValidateRequest {
    fn validate(&self) -> Result<(), ApiError>; //TODO: want this to be ApiError but getting compiler error in impl
}
