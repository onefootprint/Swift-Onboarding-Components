use super::utils;
use super::{Error, VResult};
use crate::{email::Email, NtResult, Validate};
use crate::{
    AllData, DataIdentifier, IdentityDataKind as IDK, Iso3166TwoDigitCountryCode, PhoneNumber, PiiString,
    PiiValue, ValidateArgs, DATE_FORMAT,
};
use chrono::{Datelike, NaiveDate, Utc};
use serde_with::DeserializeFromStr;
use std::str::FromStr;
use strum_macros::EnumString;

impl Validate for IDK {
    fn validate(
        self,
        value: PiiValue,
        args: ValidateArgs,
        _: &AllData,
    ) -> NtResult<Vec<(DataIdentifier, PiiString)>> {
        // Generally don't want anything to be empty
        let value = match self {
            IDK::FirstName => validate_name(value.as_string()?, args.for_bifrost)?,
            IDK::LastName => validate_name(value.as_string()?, args.for_bifrost)?,
            IDK::Dob => clean_and_validate_dob(value.as_string()?, args.for_bifrost)?,
            IDK::Ssn4 => clean_and_validate_ssn4(value.as_string()?)?,
            IDK::AddressLine1 => validate_address(value.as_string()?, args.for_bifrost)?,
            IDK::AddressLine2 => value.as_string()?,
            IDK::City => value.as_string()?,
            IDK::State => value.as_string()?, // maybe we'll want to validate state based on country some day
            IDK::Zip => utils::clean_and_validate_zip(value.as_string()?)?,
            IDK::Country => utils::clean_and_validate_country(value.as_string()?)?,
            IDK::Email => clean_and_validate_email(value.as_string()?)?,
            IDK::PhoneNumber => clean_and_validate_phone(value.as_string()?)?,
            IDK::Nationality => utils::clean_and_validate_country(value.as_string()?)?,
            IDK::UsLegalStatus => utils::parse_enum::<UsLegalStatus>(value.as_string()?)?,
            IDK::VisaKind => utils::parse_enum::<VisaKind>(value.as_string()?)?,
            IDK::VisaExpirationDate => clean_and_validate_date(value.as_string()?)?,
            IDK::Citizenships => {
                utils::parse_json_and_validate::<Vec<Iso3166TwoDigitCountryCode>, _>(value, |v| {
                    if v.is_empty() {
                        return Err(Error::InvalidLength);
                    }
                    Ok(())
                })?
            }
            // Special one that returns derived entries
            IDK::Ssn9 => {
                let ssn9 = clean_and_validate_ssn9(value.as_string()?)?;
                let ssn4 = PiiString::new(ssn9.leak().chars().skip(ssn9.leak().len() - 4).collect());
                return Ok(vec![(IDK::Ssn9.into(), ssn9), (IDK::Ssn4.into(), ssn4)]);
            }
        };
        let value = utils::validate_not_empty(value)?;
        Ok(vec![(self.into(), value)])
    }
}

fn clean_and_validate_email(value: PiiString) -> NtResult<PiiString> {
    let email = Email::from_str(value.leak())?;
    Ok(email.to_piistring())
}

fn clean_and_validate_phone(value: PiiString) -> NtResult<PiiString> {
    let phone = PhoneNumber::parse(value)?;
    Ok(phone.e164())
}

fn clean_and_validate_date(input: PiiString) -> VResult<PiiString> {
    let date = NaiveDate::parse_from_str(input.leak(), "%Y-%m-%d").map_err(|_| Error::InvalidDate)?;
    Ok(PiiString::new(date.format("%Y-%m-%d").to_string()))
}

fn clean_and_validate_dob(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    let date = NaiveDate::parse_from_str(input.leak(), DATE_FORMAT).map_err(|_| Error::InvalidDate)?;
    if for_bifrost {
        if date.year() < 1900 {
            return Err(Error::ImprobableDob);
        }

        let today = Utc::now().naive_utc().date();
        let age = (today - date).num_days() / 365;

        if age <= 13 {
            return Err(Error::ImprobableDobTooYoung);
        }
    }
    Ok(PiiString::new(date.format(DATE_FORMAT).to_string()))
}

fn validate_name(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    if for_bifrost && input.leak().len() > 1000 {
        return Err(Error::InvalidLength);
    }

    Ok(input)
}

fn validate_address(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    if for_bifrost && input.leak().len() > 1000 {
        return Err(Error::InvalidLength);
    }

    // eventually should maybe use a address verification/resolution service for this
    if for_bifrost && input.leak().to_lowercase().starts_with("po box") {
        return Err(Error::AddressIsPOBox);
    }

    Ok(input)
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

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum UsLegalStatus {
    Citizen,
    PermanentResident,
    Visa,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum VisaKind {
    E1,
    E2,
    E3,
    F1,
    G4,
    H1B,
    L1,
    O1,
    TN1,
    Other,
}

#[cfg(test)]
mod test {
    use std::collections::HashMap;

    use super::IDK::*;
    use crate::IdentityDataKind as IDK;
    use crate::PiiValue;
    use crate::Validate;
    use crate::ValidateArgs;
    use test_case::test_case;

    #[test_case(FirstName, "flerpBlerp" => Some("flerpBlerp".to_owned()))]
    #[test_case(LastName, "flerpBlerp" => Some("flerpBlerp".to_owned()))]
    #[test_case(Dob, "1234" => None)]
    #[test_case(Dob, "2023-13-25" => None)]
    #[test_case(Dob, "2023-12-32" => None)]
    #[test_case(Dob, "1876-12-25" => Some("1876-12-25".to_owned()))]
    #[test_case(Dob, "2019-02-29" => None)]
    #[test_case(Dob, "2020-02-29" => Some("2020-02-29".to_owned()))] // leap year
    #[test_case(Ssn4, "678" => None)]
    #[test_case(Ssn4, "6789" => Some("6789".to_owned()))]
    #[test_case(Ssn9, "123-45-678" => None)]
    #[test_case(Ssn9, "123-45-6789" => Some("123456789".to_owned()))]
    #[test_case(AddressLine1, "100 Nitro Way@" => Some("100 Nitro Way@".to_owned()))]
    #[test_case(AddressLine1, "100 Enclave Way" => Some("100 Enclave Way".to_owned()))]
    #[test_case(AddressLine2, "#1" => Some("#1".to_owned()))]
    #[test_case(City, "Footprint" => Some("Footprint".to_owned()))]
    #[test_case(City, "_Footprint1" => Some("_Footprint1".to_owned()))] // We don't care about special chars
    #[test_case(State, "CA" => Some("CA".to_owned()))]
    #[test_case(State, "CA1" => Some("CA1".to_owned()))] // We don't care about special chars
    #[test_case(Zip, "flerp!" => None)]
    #[test_case(Zip, "12345" => Some("12345".to_owned()))]
    #[test_case(Country, "BLERP" => None)]
    #[test_case(Country, "US" => Some("US".to_owned()))]
    #[test_case(Email, "flerp@derp@" => None)]
    #[test_case(Email, "flerp@derp.com" => Some("flerp@derp.com".to_owned()))]
    // note this is technically a valid email...whut
    // #[test_case(Email, "flerp@derp.com#sandbox" => None)] // Sandbox email
    #[test_case(PhoneNumber, "flerp" => None)]
    #[test_case(PhoneNumber, "+1-555-555-5555" => Some("+15555555555".to_owned()))]
    #[test_case(Nationality, "US" => Some("US".to_owned()))]
    #[test_case(Nationality, "Flerp" => None)]
    fn test_clean_and_validate_field_not_bifrost(idk: IDK, pii: &str) -> Option<String> {
        idk.validate(
            PiiValue::string(pii),
            ValidateArgs::for_non_portable(true),
            &HashMap::new(),
        )
        .ok()
        .and_then(|pii| pii.into_iter().next())
        .map(|pii| pii.1.leak_to_string())
    }

    #[test_case(Dob, "1876-12-25" => None)]
    // too young
    #[test_case(Dob, "2015-01-01" => None)]
    #[test_case(Dob, "2009-01-01" => Some("2009-01-01".to_owned()))]
    #[test_case(Dob, "1976-12-25" => Some("1976-12-25".to_owned()))]
    #[test_case(FirstName, "" => None)]
    #[test_case(LastName, "" => None)]
    #[test_case(AddressLine1, "" => None)]
    #[test_case(FirstName, (0..1001).map(|_| "X").collect::<String>().as_str() => None)]
    #[test_case(LastName, (0..1001).map(|_| "X").collect::<String>().as_str() => None)]
    #[test_case(AddressLine1, (0..1001).map(|_| "X").collect::<String>().as_str() => None)]
    fn test_clean_and_validate_field_for_bifrost(idk: IDK, pii: &str) -> Option<String> {
        let args = ValidateArgs {
            for_bifrost: true,
            ..ValidateArgs::for_tests()
        };
        idk.validate(PiiValue::string(pii), args, &HashMap::new())
            .ok()
            .and_then(|pii| pii.into_iter().next())
            .map(|pii| pii.1.leak_to_string())
    }
}
