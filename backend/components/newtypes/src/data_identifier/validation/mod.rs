use crate::{NtResult, PiiString};
use regex::Regex;

mod business;
mod identity;
mod investor_profile;

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
    #[error("The entered address is a PO Box")]
    AddressIsPOBox,
    #[error("Cannot parse: {0}")]
    CannotParseEnum(#[from] strum::ParseError),
    #[error("Cannot parse: {0}")]
    CannotParseJson(#[from] serde_json::Error),
}

pub(super) type VResult<T> = Result<T, Error>;

lazy_static! {
    // some zip codes are alphanumeric, can also contain -'s and spaces
    // simple regex just to make sure input is base-level clean
    // https://en.wikipedia.org/wiki/Postal_code#Alphanumeric_postal_codes
    pub static ref ZIP_CHARS: Regex = Regex::new(r"^([A-Za-z0-9\- ]*)$").unwrap();
}

fn clean_and_validate_zip(input: PiiString) -> VResult<PiiString> {
    if !ZIP_CHARS.is_match(input.leak()) {
        return Err(Error::InvalidZipCharacter);
    }
    Ok(input)
}

/// list of valid iso3166-alpha-2 country codes, from https://datahub.io/core/country-codes#data
/// eventually we should maybe just pony up and pay for the subscription to iso: https://www.iso.org/publication/PUB500001.html
/// Channel islands does not have a country code
const ISO_3166_COUNTRIES: [&str; 249] = [
    "TW", "AF", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS",
    "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "VG",
    "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "HK", "MO", "CX", "CC",
    "CO", "KM", "CG", "CK", "CR", "HR", "CU", "CW", "CY", "CZ", "CI", "KP", "CD", "DK", "DJ", "DM", "DO",
    "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA",
    "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM",
    "VA", "HN", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ",
    "KE", "KI", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MG", "MW", "MY", "MV",
    "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA",
    "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MP", "NO", "OM", "PK", "PW", "PA", "PG",
    "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "KR", "MD", "RO", "RU", "RW", "RE", "BL", "SH", "KN",
    "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB",
    "SO", "ZA", "GS", "SS", "ES", "LK", "PS", "SD", "SR", "SJ", "SE", "CH", "SY", "TJ", "TH", "MK", "TL",
    "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "TZ", "UM", "VI", "US",
    "UY", "UZ", "VU", "VE", "VN", "WF", "EH", "YE", "ZM", "ZW", "AX",
];

fn clean_and_validate_country(input: PiiString) -> VResult<PiiString> {
    if !ISO_3166_COUNTRIES.contains(&input.leak()) {
        return Err(Error::InvalidCountry);
    }
    Ok(input)
}
