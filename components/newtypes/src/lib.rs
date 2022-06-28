#[macro_use]
extern crate diesel_derive_newtype;

#[macro_use]
extern crate lazy_static;

mod id;
pub use self::id::*;
pub use self::phone_number::*;

pub mod api_types;
pub use api_types::*;

pub mod db_types;
pub use db_types::*;

mod b64;
pub use b64::Base64Data;
pub use serde;

mod auth_token;
pub use self::auth_token::*;

pub mod fingerprint;
pub use self::fingerprint::*;

#[derive(Debug, Clone, thiserror::Error)]
pub enum Error {
    #[error("invalid phone number")]
    InvalidPhoneNumber,
    #[error("invalid length ssn")]
    InvalidSsn,
    #[error("invalid email address")]
    InvalidEmail,
    #[error("dob error: {0}")]
    DobError(#[from] DobError),
    #[error("address error: {0}")]
    AddressError(#[from] AddressError),
}

#[derive(Debug, Clone, thiserror::Error)]
pub enum DobError {
    #[error("nonexistant date for dob %Y-%m-%d: {0}")]
    NonexistantDate(String),
    #[error("invalid day for dob: {0}, day must be between 1 and 31")]
    InvalidDay(u32),
    #[error("invalid month for dob: {0}, month must be between 1 and 12")]
    InvalidMonth(u32),
    #[error("invalid year for dob: {0}, must not be born in the future or be impossibly old")]
    InvalidYear(i32),
}

#[derive(Debug, Clone, thiserror::Error)]
pub enum AddressError {
    #[error("invalid zip code, zip code must be alphanumeric: {0}")]
    InvalidZip(String),
    #[error("invalid country code: {0}, country code must be 2-digit ISO 3166-1 Alpha 2")]
    InvalidCountry(String),
    #[error("invalid address provided: {0}, address must not contain special characters other than #")]
    InvalidAddressCharacters(String),
    #[error("invalid characters provided: {0}, city and/or state must not contain special characters")]
    InvalidCharacters(String),
}
