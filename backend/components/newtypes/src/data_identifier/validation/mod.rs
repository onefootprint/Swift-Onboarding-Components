use crate::{NtResult, PiiString, ValidateArgs};

mod business;
mod card;
mod identity;
mod investor_profile;
mod utils;

pub use business::{BusinessOwnerData, KycedBusinessOwnerData};
pub use card::Expiration as CardExpiration;
pub use investor_profile::Declaration;

pub trait Validate {
    /// Performs basic cleaning and validation for all data that we store in our vaults.
    fn validate(&self, value: PiiString, args: ValidateArgs) -> NtResult<PiiString>;
}

#[derive(Debug, thiserror::Error)]
/// These are all of the errors that can occur when cleaning and validating input data
pub enum Error {
    #[error("Invalid length")]
    InvalidLength,
    #[error("Invalid character")]
    InvalidCharacter,
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
    #[error("The entered address is a PO Box")]
    AddressIsPOBox,
    #[error("Cannot parse: {0}")]
    CannotParseEnum(#[from] strum::ParseError),
    #[error("Cannot parse: {0}")]
    CannotParseJson(#[from] serde_json::Error),
    #[error("The beneficial owners' ownership stakes must not sum to more than 100%")]
    BusinessOwnersStakeAbove100,
    #[error("You only need to provide beneficial owners who own at least 25% of the business")]
    BusinessOwnerStakeBelow25,
    #[error("Contact info for beneficial owners must be unique")]
    NonUniqueBusinessOwners,
    #[error("Invalid phone or email")]
    SandboxNotAllowed,
    #[error("Couldn't parse as host. Should not include URL scheme or path")]
    UrlParseError(#[from] url::ParseError),
    #[error("Invalid host. Should be a domain")]
    InvalidHost,
    #[error("{0}")]
    CardError(String),
    #[error("Invalid month")]
    InvalidMonth,
    #[error("Invalid year")]
    InvalidYear,
    #[error("Invalid expiration")]
    InvalidExpiration,
    #[error("{0}")]
    CannotParseInt(#[from] std::num::ParseIntError),
    #[error("Can only provide sandbox phones and emails in sandbox mode")]
    InvalidSandboxState,
    #[error("Cannot set card last4, expiration month/year (must be derived from number or expiration)")]
    CardEntriesMustBeDerivedOnly,
}

pub type VResult<T> = Result<T, Error>;
