use super::{Error, VResult};
use crate::{Iso3166TwoDigitCountryCode, PiiString, PiiValue};
use regex::Regex;
use serde::de::DeserializeOwned;
use std::str::FromStr;

lazy_static! {
    // some zip codes are alphanumeric, can also contain -'s and spaces
    // simple regex just to make sure input is base-level clean
    // https://en.wikipedia.org/wiki/Postal_code#Alphanumeric_postal_codes
    pub static ref ZIP_CHARS: Regex = Regex::new(r"^([A-Za-z0-9\- ]*)$").unwrap();
}

pub(super) fn clean_and_validate_zip(input: PiiString) -> VResult<PiiString> {
    if !ZIP_CHARS.is_match(input.leak()) {
        return Err(Error::InvalidZipCharacter);
    }
    Ok(input)
}

pub(super) fn clean_and_validate_country(input: PiiString) -> VResult<PiiString> {
    parse_enum::<Iso3166TwoDigitCountryCode>(input.clone()).map_err(|_| Error::InvalidCountry)?;

    Ok(input)
}

pub(super) fn validate_not_empty(input: PiiString) -> VResult<PiiString> {
    if input.leak().is_empty() {
        return Err(Error::InvalidLength);
    }
    Ok(input)
}

pub(super) fn parse_enum<T>(value: PiiString) -> VResult<PiiString>
where
    T: FromStr<Err = strum::ParseError>,
{
    value.parse_into::<T>()?;
    Ok(value)
}

pub(super) fn parse_json<T>(value: PiiValue) -> VResult<PiiString>
where
    T: DeserializeOwned,
{
    parse_json_and_validate::<T, _>(value, |_| Ok(()))
}

pub(super) fn parse_json_and_validate<T, F>(value: PiiValue, f: F) -> VResult<PiiString>
where
    T: DeserializeOwned,
    F: FnOnce(T) -> VResult<()>,
{
    parse_json_and_map(value.clone(), |v| {
        f(v)?;
        let result = value.to_piistring()?; // Return unchanged value
        Ok(result)
    })
}

pub(super) fn parse_json_and_map<T, F>(value: PiiValue, f: F) -> VResult<PiiString>
where
    T: DeserializeOwned,
    F: FnOnce(T) -> VResult<PiiString>,
{
    let parsed_value = value.deserialize_maybe_str()?;
    let value = f(parsed_value)?;
    Ok(value)
}
