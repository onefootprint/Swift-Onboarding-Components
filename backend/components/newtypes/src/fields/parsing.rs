use crate::{email::Email, NtResult};
use chrono::NaiveDate;
use regex::Regex;
use std::str::FromStr;

use crate::{IdentityDataKind as IDK, PhoneNumber, PiiString};

pub(super) fn clean_and_validate_field(idk: IDK, input: PiiString) -> NtResult<PiiString> {
    let result = match idk {
        IDK::FirstName => input,
        IDK::LastName => input,
        IDK::Dob => clean_and_validate_dob(input)?,
        IDK::Ssn4 => clean_and_validate_ssn4(input)?,
        IDK::Ssn9 => clean_and_validate_ssn9(input)?,
        IDK::AddressLine1 => input,
        IDK::AddressLine2 => input,
        IDK::City => input,
        IDK::State => input, // maybe we'll want to validate state based on country some day
        IDK::Zip => clean_and_validate_zip(input)?,
        IDK::Country => clean_and_validate_country(input)?,
        IDK::Email => Email::from_str(input.leak())?.to_piistring(),
        IDK::PhoneNumber => PhoneNumber::parse(input)?.e164_with_suffix(),
    };
    Ok(result)
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
}

pub(super) type VResult<T> = Result<T, Error>;

fn clean_and_validate_dob(input: PiiString) -> VResult<PiiString> {
    let date = NaiveDate::parse_from_str(input.leak(), "%Y-%m-%d").map_err(|_| Error::InvalidDate)?;
    Ok(PiiString::new(date.format("%Y-%m-%d").to_string()))
}

fn clean_and_validate_ssn4(input: PiiString) -> VResult<PiiString> {
    if input.leak().len() != 4 {
        return Err(Error::InvalidLength);
    }
    if input.leak().chars().any(|c| !c.is_ascii_digit()) {
        return Err(Error::NonDigitCharacter);
    }
    Ok(input)
}

fn clean_and_validate_ssn9(input: PiiString) -> VResult<PiiString> {
    // Allow providing hyphens in input. This is permissive for now
    let input = PiiString::new(input.leak().chars().filter(|p| p != &'-').collect());
    if input.leak().len() != 9 {
        return Err(Error::InvalidLength);
    }
    if input.leak().chars().any(|c| !c.is_ascii_digit()) {
        return Err(Error::NonDigitCharacter);
    }
    Ok(input)
}

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
