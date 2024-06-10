use super::utils::{
    self,
    validate_state,
    AgeHelper,
    PO_BOX,
};
use super::{
    Error,
    VResult,
};
use crate::email::Email;
use crate::ssn::{
    Ssn4,
    Ssn9,
};
use crate::{
    AllData,
    CleanAndValidate,
    DataIdentifierValue,
    IdentityDataKind as IDK,
    Iso3166TwoDigitCountryCode,
    NtResult,
    PhoneNumber,
    PiiJsonValue,
    PiiString,
    ValidateArgs,
    DATE_FORMAT,
};
use chrono::{
    Datelike,
    NaiveDate,
    Utc,
};
use serde_with::DeserializeFromStr;
use std::str::FromStr;
use strum_macros::EnumString;

pub enum IdentityData {
    // TODO: Make this Ssn9(Ssn9) once we decide on one of old_clean_and_validate_ssn9 or
    // new_clean_and_validate_ssn9.
    Sss9(PiiString),
}

impl CleanAndValidate for IDK {
    type Parsed = Option<IdentityData>;

    fn clean_and_validate(
        self,
        value: PiiJsonValue,
        args: ValidateArgs,
        all_data: &AllData,
    ) -> NtResult<DataIdentifierValue<Self::Parsed>> {
        // Generally don't want anything to be empty
        let value = match self {
            IDK::FirstName => validate_name(value.as_string()?, args.for_bifrost)?,
            IDK::MiddleName => validate_name(value.as_string()?, args.for_bifrost)?,
            IDK::LastName => validate_name(value.as_string()?, args.for_bifrost)?,
            IDK::Dob => clean_and_validate_dob(value.as_string()?, args.for_bifrost)?,
            IDK::Ssn4 => clean_and_validate_ssn4(value.as_string()?)?,
            IDK::AddressLine1 => validate_address_line1(value.as_string()?, args.for_bifrost)?,
            IDK::AddressLine2 => validate_address_line2(value.as_string()?, args.for_bifrost)?,
            IDK::City => validate_city(value.as_string()?, args.for_bifrost)?,
            IDK::State => validate_state(value.as_string()?, all_data.get(&IDK::Country.into()))?,
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
            IDK::Ssn9 => {
                let ssn9 = clean_and_validate_ssn9(value.as_string()?)?;
                return Ok(DataIdentifierValue {
                    di: self.into(),
                    value: ssn9.clone(),
                    parsed: Some(IdentityData::Sss9(ssn9)),
                });
            }
        };
        let value = utils::validate_not_empty(value)?;

        Ok(DataIdentifierValue {
            di: self.into(),
            value,
            parsed: None,
        })
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
    let dob = NaiveDate::parse_from_str(input.leak(), DATE_FORMAT).map_err(|_| Error::InvalidDate)?;
    if for_bifrost {
        // if someone adds date like `2006-01-01` as "01/01/06" in bifrost
        if dob.year() < 1000 {
            return Err(Error::InvalidDobYear);
        }
        if dob.year() < 1900 {
            return Err(Error::ImprobableDob);
        }

        let today = Utc::now().naive_utc().date();
        let age_helper = AgeHelper { dob };

        if !age_helper.age_is_gte(today, 14) {
            return Err(Error::ImprobableDobTooYoung);
        }
    }
    Ok(PiiString::new(dob.format(DATE_FORMAT).to_string()))
}

fn validate_name(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    if for_bifrost && input.leak().len() > 1000 {
        return Err(Error::InvalidLength);
    }

    Ok(input)
}

fn validate_po_box(input: &PiiString) -> VResult<()> {
    if PO_BOX.is_match(input.leak()) {
        return Err(Error::AddressIsPOBox);
    }

    Ok(())
}

fn validate_address_line1(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    let address = input.leak();
    if for_bifrost {
        if address.len() > 1000 || address.is_empty() {
            return Err(Error::InvalidLength);
        }

        validate_po_box(&input)?;

        if address.chars().all(|c| c.is_ascii_digit()) {
            return Err(Error::InvalidAddressAllDigits);
        }
    }

    Ok(input)
}

fn validate_city(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    let city = input.leak();
    if for_bifrost && city.chars().all(|c| c.is_ascii_digit()) {
        return Err(Error::InvalidAddressAllDigits);
    }

    Ok(input)
}

fn validate_address_line2(input: PiiString, for_bifrost: bool) -> VResult<PiiString> {
    if for_bifrost && input.leak().len() > 1000 {
        return Err(Error::InvalidLength);
    }

    // eventually should maybe use a address verification/resolution service for this
    if for_bifrost {
        validate_po_box(&input)?;
    }

    Ok(input)
}

fn new_clean_and_validate_ssn4(input: PiiString) -> NtResult<PiiString> {
    let ssn4 = Ssn4::parse(input)?;
    Ok(ssn4.format())
}

fn old_clean_and_validate_ssn4(input: PiiString) -> VResult<PiiString> {
    if input.leak().len() != 4 {
        return Err(Error::InvalidLength);
    }
    if input.leak().chars().any(|c| !c.is_ascii_digit()) {
        return Err(Error::NonDigitCharacter);
    }
    Ok(input)
}

fn clean_and_validate_ssn4(input: PiiString) -> VResult<PiiString> {
    let new_result = new_clean_and_validate_ssn4(input.clone());
    let old_result = old_clean_and_validate_ssn4(input);

    if new_result.is_ok() != old_result.is_ok() {
        tracing::warn!(
            ?new_result,
            ?old_result,
            "Mismatching results for new and old SSN4 validation",
        );
    }

    old_result
}

fn new_clean_and_validate_ssn9(input: PiiString) -> NtResult<PiiString> {
    let ssn9 = Ssn9::parse(input)?;
    Ok(ssn9.format_no_dashes())
}

fn old_clean_and_validate_ssn9(input: PiiString) -> VResult<PiiString> {
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

fn clean_and_validate_ssn9(input: PiiString) -> VResult<PiiString> {
    let new_result = new_clean_and_validate_ssn9(input.clone());
    let old_result = old_clean_and_validate_ssn9(input);

    if new_result.is_ok() != old_result.is_ok() {
        tracing::warn!(
            ?new_result,
            ?old_result,
            "Mismatching results for new and old SSN9 validation",
        );
    }

    old_result
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString, PartialEq, Eq)]
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
    use super::IDK::*;
    use crate::{
        CleanAndValidate,
        IdentityDataKind as IDK,
        PiiJsonValue,
        ValidateArgs,
    };
    use std::collections::HashMap;
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
        idk.clean_and_validate(
            PiiJsonValue::string(pii),
            ValidateArgs::for_non_portable(true),
            &HashMap::new(),
        )
        .ok()
        .map(|div| div.value.leak_to_string())
    }

    #[test_case(Dob, "1876-12-25" => None)]
    #[test_case(Dob, "06-12-25" => None; "2 character date")]
    // too young
    #[test_case(Dob, "2015-01-01" => None)]
    #[test_case(Dob, "2009-01-01" => Some("2009-01-01".to_owned()))]
    #[test_case(Dob, "1976-12-25" => Some("1976-12-25".to_owned()))]
    #[test_case(FirstName, "" => None)]
    #[test_case(LastName, "" => None)]
    #[test_case(AddressLine1, "" => None)]
    #[test_case(AddressLine1, "100111112" => None)]
    #[test_case(City, "100111112" => None)]
    #[test_case(City, "Waffleton" => Some("Waffleton".to_owned()))]
    #[test_case(FirstName, (0..1001).map(|_| "X").collect::<String>().as_str() => None)]
    #[test_case(LastName, (0..1001).map(|_| "X").collect::<String>().as_str() => None)]
    #[test_case(AddressLine1, (0..1001).map(|_| "X").collect::<String>().as_str() => None)]
    fn test_clean_and_validate_field_for_bifrost(idk: IDK, pii: &str) -> Option<String> {
        let args = ValidateArgs {
            for_bifrost: true,
            ..ValidateArgs::for_tests()
        };
        idk.clean_and_validate(PiiJsonValue::string(pii), args, &HashMap::new())
            .ok()
            .map(|div| div.value.leak_to_string())
    }
}
