use super::utils;
use super::VResult;
use crate::{BusinessDataKind as BDK, PhoneNumber, PiiString};
use crate::{NtResult, Validate};

impl Validate for BDK {
    fn validate(&self, value: PiiString, _for_bifrost: bool) -> NtResult<PiiString> {
        let result = match self {
            BDK::Name => value,
            BDK::Dba => value,
            BDK::Website => value, // TODO
            BDK::PhoneNumber => PhoneNumber::parse(value)?.e164_with_suffix(),
            BDK::Ein => value, // TODO
            BDK::AddressLine1 => value,
            BDK::AddressLine2 => value,
            BDK::City => value,
            BDK::State => value,
            BDK::Zip => utils::clean_and_validate_zip(value)?,
            BDK::Country => utils::clean_and_validate_country(value)?,
            BDK::BeneficialOwners => clean_and_validate_beneficial_owners(value)?, // TODO
            BDK::CorporationType => value,                                         // TODO
        };
        Ok(result)
    }
}

fn clean_and_validate_beneficial_owners(input: PiiString) -> VResult<PiiString> {
    // TODO one day, json deserialize the BOs and make sure they follow some spec
    Ok(input)
}

#[cfg(test)]
mod test {
    use super::BDK::*;
    use crate::BusinessDataKind as BDK;
    use crate::PiiString;
    use crate::Validate;
    use test_case::test_case;

    // TODO more tests
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
    #[test_case(PhoneNumber, "flerp" => None)]
    #[test_case(PhoneNumber, "+1-555-555-5555" => Some("+15555555555".to_owned()))]
    #[test_case(PhoneNumber, "+15555555555#sandbox" => Some("+15555555555#sandbox".to_owned()))] // Sandbox phone
    fn test_clean_and_validate_field_not_bifrost(bdk: BDK, pii: &str) -> Option<String> {
        bdk.validate(PiiString::new(pii.to_owned()), false)
            .ok()
            .map(|pii| pii.leak_to_string())
    }
}
