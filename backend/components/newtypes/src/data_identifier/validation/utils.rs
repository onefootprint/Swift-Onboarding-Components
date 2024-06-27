use super::Error;
use super::VResult;
use crate::Iso3166TwoDigitCountryCode;
use crate::PiiJsonValue;
use crate::PiiString;
use crate::UsStateAndTerritories;
use chrono::Datelike;
use chrono::NaiveDate;
use regex::Regex;
use serde::de::DeserializeOwned;
use std::str::FromStr;

lazy_static! {
    // some zip codes are alphanumeric, can also contain -'s and spaces
    // simple regex just to make sure input is base-level clean
    // https://en.wikipedia.org/wiki/Postal_code#Alphanumeric_postal_codes
    pub static ref ZIP_CHARS: Regex = Regex::new(r"^([A-Za-z0-9\- ]*)$").unwrap();
    pub static ref PO_BOX: Regex = Regex::new(r".*(?i)p\.?o\.?\s?+box.*$").unwrap();
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

pub(super) fn parse_json<T>(value: PiiJsonValue) -> VResult<PiiString>
where
    T: DeserializeOwned,
{
    parse_json_and_validate::<T, _>(value, |_| Ok(()))
}

pub(super) fn parse_json_and_validate<T, F>(value: PiiJsonValue, f: F) -> VResult<PiiString>
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

pub(super) fn parse_json_and_map<T, F>(value: PiiJsonValue, f: F) -> VResult<PiiString>
where
    T: DeserializeOwned,
    F: FnOnce(T) -> VResult<PiiString>,
{
    let parsed_value = value.deserialize_maybe_str()?;
    let value = f(parsed_value)?;
    Ok(value)
}

pub(super) fn validate_state(
    value: PiiString,
    provided_country: Option<&PiiJsonValue>,
) -> VResult<PiiString> {
    let us = PiiJsonValue::from_piistring(PiiString::new(Iso3166TwoDigitCountryCode::US.to_string()));

    // if country is US we require state to be 50 states + US territories
    if provided_country == Some(&us) {
        // Validate state is a US state if the country is US
        parse_enum::<UsStateAndTerritories>(value)
    } else {
        Ok(value)
    }
}

// A struct that helps with ages
pub struct AgeHelper {
    pub dob: NaiveDate,
}
impl AgeHelper {
    pub fn age_is_gte(&self, today: NaiveDate, age_to_check: i32) -> bool {
        // if there haven't been enough years, that's easy
        let difference_from_today_in_years = today.year() - self.dob.year();
        match difference_from_today_in_years.cmp(&age_to_check) {
            // not enough years
            std::cmp::Ordering::Less => false,
            // we're in the bday year
            std::cmp::Ordering::Equal => {
                match today.month0().cmp(&self.dob.month0()) {
                    // we're before the bday
                    std::cmp::Ordering::Less => false,
                    // we're in bday month
                    std::cmp::Ordering::Equal => {
                        match today.day0().cmp(&self.dob.day0()) {
                            // we're before the bday
                            std::cmp::Ordering::Less => false,
                            // happy bday
                            std::cmp::Ordering::Equal => true,
                            // happy belated
                            std::cmp::Ordering::Greater => true,
                        }
                    }
                    // we're in a month after
                    std::cmp::Ordering::Greater => true,
                }
            }
            // we're gt than 18 years
            std::cmp::Ordering::Greater => true,
        }
    }
}

/// validates simple date format in `YYYY-MM-DD` format
pub fn clean_and_validate_formation_date(input: PiiString) -> VResult<PiiString> {
    const DATE_FORMAT: &str = "%Y-%m-%d";
    let dob = NaiveDate::parse_from_str(input.leak(), DATE_FORMAT).map_err(|_| Error::InvalidDate)?;
    Ok(PiiString::new(dob.format(DATE_FORMAT).to_string()))
}
#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDate;
    use test_case::test_case;

    #[test_case("po box" => true; "lower")]
    #[test_case("P.O. Box" => true)]
    #[test_case("My P.O. Box" => true)]
    #[test_case("   PO.     Box    " => true)]
    #[test_case("to box" => false)]
    #[test_case("Apt 1." => false)]
    #[test_case("Apt P, Box    " => false)]
    #[test_case("" => false)]
    #[test_case("122344%%$^" => false)]
    fn test_po_box_regex(s: &str) -> bool {
        PO_BOX.is_match(s)
    }

    #[test_case("1990-01-01", "2021-01-01", 18 => true; "older than 18")]
    #[test_case("1990-01-01", "2008-01-01", 60 => false; "not older than year provided")]
    #[test_case("1990-01-01", "2008-01-01", 18 => true; "bday")]
    #[test_case("1990-01-01", "2007-12-31", 18 => false; "day before 18th bday")]
    #[test_case("2004-02-29", "2022-03-01", 18 => true; "dob year is leap year, today is day after bday in non-leap year")]
    #[test_case("2004-02-29", "2022-02-28", 18 => false; "dob year is leap year, today is day before bday in non- leap year")]
    #[test_case("2004-02-29", "2022-03-01", 18 => true; "dob year is leap year, day after bday in non-leap year")]
    #[test_case("2006-02-28", "2024-02-29", 18 => true; "day after bday, current year leap year")]
    #[test_case("2024-02-28", "2022-02-28", 18 => false; "dob after today")]
    fn test_age_is_gt(dob: &str, now: &str, age_to_check: i32) -> bool {
        let dob = NaiveDate::parse_from_str(dob, "%Y-%m-%d").unwrap();
        let now = NaiveDate::parse_from_str(now, "%Y-%m-%d").unwrap();
        let age_helper = AgeHelper { dob };
        age_helper.age_is_gte(now, age_to_check)
    }
}
