use super::{Error, VResult};
use crate::{email::Email, NtResult, Validate};
use crate::{IdentityDataKind as IDK, PhoneNumber, PiiString};
use chrono::{Datelike, NaiveDate};
use std::str::FromStr;

impl Validate for IDK {
    fn validate(&self, value: PiiString, for_bifrost: bool) -> NtResult<PiiString> {
        let result = match self {
            IDK::FirstName => validate_name(value, for_bifrost)?,
            IDK::LastName => validate_name(value, for_bifrost)?,
            IDK::Dob => clean_and_validate_dob(value, for_bifrost)?,
            IDK::Ssn4 => clean_and_validate_ssn4(value)?,
            IDK::Ssn9 => clean_and_validate_ssn9(value)?,
            IDK::AddressLine1 => validate_address(value, for_bifrost)?,
            IDK::AddressLine2 => value,
            IDK::City => value,
            IDK::State => value, // maybe we'll want to validate state based on country some day
            IDK::Zip => super::clean_and_validate_zip(value)?,
            IDK::Country => super::clean_and_validate_country(value)?,
            IDK::Email => Email::from_str(value.leak())?.to_piistring(),
            IDK::PhoneNumber => PhoneNumber::parse(value)?.e164_with_suffix(),
        };
        Ok(result)
    }
}

fn clean_and_validate_dob(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    let date = NaiveDate::parse_from_str(input.leak(), "%Y-%m-%d").map_err(|_| Error::InvalidDate)?;
    if for_bifrost && date.year() < 1900 {
        return Err(Error::ImprobableDob);
    }
    Ok(PiiString::new(date.format("%Y-%m-%d").to_string()))
}

fn validate_name(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    if for_bifrost && (input.leak().is_empty() || input.leak().len() > 1000) {
        return Err(Error::InvalidLength);
    }

    Ok(input)
}

fn validate_address(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    if for_bifrost && (input.leak().is_empty() || input.leak().len() > 1000) {
        return Err(Error::InvalidLength);
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

#[cfg(test)]
mod test {
    use super::IDK::*;
    use crate::IdentityDataKind as IDK;
    use crate::PiiString;
    use crate::Validate;
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
    #[test_case(Email, "flerp@derp.com#sandbox" => Some("flerp@derp.com#sandbox".to_owned()))] // Sandbox email
    #[test_case(PhoneNumber, "flerp" => None)]
    #[test_case(PhoneNumber, "+1-555-555-5555" => Some("+15555555555".to_owned()))]
    #[test_case(PhoneNumber, "+15555555555#sandbox" => Some("+15555555555#sandbox".to_owned()))] // Sandbox phone
    fn test_clean_and_validate_field_not_bifrost(idk: IDK, pii: &str) -> Option<String> {
        idk.validate(PiiString::new(pii.to_owned()), false)
            .ok()
            .map(|pii| pii.leak_to_string())
    }

    #[test_case(Dob, "1876-12-25" => None)]
    #[test_case(Dob, "1976-12-25" => Some("1976-12-25".to_owned()))]
    #[test_case(FirstName, "" => None)]
    #[test_case(LastName, "" => None)]
    #[test_case(AddressLine1, "" => None)]
    #[test_case(FirstName, (0..1001).map(|_| "X").collect::<String>().as_str() => None)]
    #[test_case(LastName, (0..1001).map(|_| "X").collect::<String>().as_str() => None)]
    #[test_case(AddressLine1, (0..1001).map(|_| "X").collect::<String>().as_str() => None)]
    fn test_clean_and_validate_field_for_bifrost(idk: IDK, pii: &str) -> Option<String> {
        idk.validate(PiiString::new(pii.to_owned()), true)
            .ok()
            .map(|pii| pii.leak_to_string())
    }
}
