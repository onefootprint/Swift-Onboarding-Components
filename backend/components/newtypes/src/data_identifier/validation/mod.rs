use crate::{NtResult, PiiString};

mod identity;

pub trait Validate {
    /// Performs basic cleaning and validation for all data that we store in our vaults.
    /// When `for_bifrost` is true, performs more advanced validation that attempts to proactively
    /// prevent sending invalid data for verification to vendors
    fn validate(&self, value: PiiString, for_bifrost: bool) -> NtResult<PiiString>;
}

#[derive(Debug, thiserror::Error)]
/// These are all of the errors that can occur when cleaning and validating input data
pub enum Error {
    #[error("Invalid length")]
    InvalidLength,
    #[error("Invalid character: can only provide ascii digits")]
    NonDigitCharacter,
    #[error("Invalid character: can only provide alphanumeric with `-` or ` `")]
    InvalidZipCharacter,
    #[error("Invalid country code: must provide two-digit ISO 3166 country code")]
    InvalidCountry,
    #[error("Invalid date: must provide a valid date in ISO 8601 format, YYYY-MM-DD")]
    InvalidDate,
    #[error("The entered date of birth results in an improbable age")]
    ImprobableDob,
}

pub(super) type VResult<T> = Result<T, Error>;
