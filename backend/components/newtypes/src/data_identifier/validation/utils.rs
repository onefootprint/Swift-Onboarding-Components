use super::{Error, VResult};
use crate::PiiString;
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

/// list of valid iso3166-alpha-2 country codes, from https://datahub.io/core/country-codes#data
/// eventually we should maybe just pony up and pay for the subscription to iso: https://www.iso.org/publication/PUB500001.html
/// Channel islands does not have a country code
pub const ISO_3166_COUNTRIES: [&str; 249] = [
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

pub(super) fn clean_and_validate_country(input: PiiString) -> VResult<PiiString> {
    if !ISO_3166_COUNTRIES.contains(&input.leak()) {
        return Err(Error::InvalidCountry);
    }
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

pub(super) fn parse_json<T>(value: PiiString) -> VResult<PiiString>
where
    T: DeserializeOwned,
{
    parse_json_and_validate::<T, _>(value, |_| Ok(()))
}

pub(super) fn parse_json_and_validate<T, F>(value: PiiString, f: F) -> VResult<PiiString>
where
    T: DeserializeOwned,
    F: FnOnce(T) -> VResult<()>,
{
    parse_json_and_map(value.clone(), |v| {
        f(v)?;
        Ok(value) // Return unchanged value
    })
}

pub(super) fn parse_json_and_map<T, F>(value: PiiString, f: F) -> VResult<PiiString>
where
    T: DeserializeOwned,
    F: FnOnce(T) -> VResult<PiiString>,
{
    let parsed_value = value.deserialize()?;
    let value = f(parsed_value)?;
    Ok(value)
}
