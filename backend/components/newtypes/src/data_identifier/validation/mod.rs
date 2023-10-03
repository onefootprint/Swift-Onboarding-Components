use std::collections::HashMap;

use crate::{CollectedDataOption, DataIdentifier, NtResult, PiiJsonValue, PiiString, ValidateArgs};

mod business;
mod card;
mod identity;
mod investor_profile;
mod utils;

pub use business::{BusinessOwnerData, KycedBusinessOwnerData};
pub use card::CardIssuer;
pub use identity::UsLegalStatus;
pub use investor_profile::Declaration;

pub type AllData = HashMap<DataIdentifier, PiiJsonValue>;

pub const DATE_FORMAT: &str = "%Y-%m-%d";

pub trait Validate {
    /// Performs basic cleaning and validation for all data that we store in our vaults.
    fn validate(
        self,
        value: PiiJsonValue,
        args: ValidateArgs,
        all_data: &AllData,
    ) -> NtResult<Vec<(DataIdentifier, PiiString)>>;
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
    #[error("The entered date of birth results in an improbably young age")]
    ImprobableDobTooYoung,
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
    #[error("Cannot provide sandbox ID in live mode. Please remove the sandbox ID.")]
    SandboxDataInLiveMode,
    #[error("Cannot specify this piece of data. It will automatically be derived.")]
    CannotSpecifyDerivedEntry,
    #[error("Cannot vault this piece of data.")]
    CannotVault,
    #[error("Cannot vault document data. Please use the vault upload endpoint instead for this attribute.")]
    CannotVaultDocument,
    #[error("Cannot add {0} when vault already has full data")]
    PartialUpdateNotAllowed(CollectedDataOption),
    #[error("This piece of data is already set and cannot be replaced.")]
    CannotReplaceData,
    #[error("Expected string value, received JSON value.")]
    ExpectedStringFormat,
}

pub type VResult<T> = Result<T, Error>;
