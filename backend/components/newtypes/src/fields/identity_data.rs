use crate::address::{AddressLine, City, Country, State, Zip};
use crate::dob::{DateOfBirth, Dob};
use crate::email::Email;
use crate::name::Name;
use crate::ssn::{Ssn4, Ssn9};
use crate::{CollectedDataOption, DataIdentifier, IdentityDataKind as IDK, PhoneNumber, PiiString};
use crate::{DataValidationError, NtResult};
use either::Either::{Left, Right};
use itertools::Itertools;
use std::collections::{HashMap, HashSet};
use std::str::FromStr;

pub type DataRequest = HashMap<DataIdentifier, PiiString>;
pub type IdentityDataRequest = HashMap<IDK, PiiString>;

pub fn clean_and_validate_id_data(id_data: IdentityDataRequest) -> NtResult<IdentityDataRequest> {
    // Make sure all keys provided are parts of coherent CollectedDataOptions.
    // For ex, can't specify FirstName without LastName
    let id_keys = id_data.keys().cloned().collect_vec();
    let extra_idks = extra_id_kinds(id_keys);
    if !extra_idks.is_empty() {
        return Err(DataValidationError::ExtraFieldError(extra_idks).into());
    }

    // Iterate through keys, use validation function per key and keep track of errors
    let (cleaned_id_data, errors): (HashMap<_, _>, HashMap<_, _>) =
        id_data
            .into_iter()
            .partition_map(|(k, v)| match clean_and_validate_field(k, v) {
                Ok(v) => Left((k, v)),
                Err(v) => Right((k, v)),
            });
    if !errors.is_empty() {
        return Err(DataValidationError::FieldValidationError(errors).into());
    }

    Ok(cleaned_id_data)
}

/// Calculates the unnecessary IDKs that aren't part of any coherent CDO.
/// For example, if you provide FirstName without LastName, we can't save your FirstName
fn extra_id_kinds(id_kinds: Vec<IDK>) -> Vec<IDK> {
    // Get all the CDOs represented in here
    let cdos = CollectedDataOption::list_from(id_kinds.clone());
    // Is there anything weird with SSN?
    // TODO: Overwrite ssn4 if ssn9 is given
    let represented_idks: HashSet<_> = cdos.into_iter().flat_map(|cdo| cdo.attributes()).collect();
    let id_kinds: HashSet<_> = id_kinds.into_iter().collect();
    // Keys given minus represented keys
    id_kinds.difference(&represented_idks).cloned().collect_vec()
}

fn clean_and_validate_field(idk: IDK, input: PiiString) -> NtResult<PiiString> {
    let result = match idk {
        IDK::FirstName => Name::from_str(input.leak())?.into(),
        IDK::LastName => Name::from_str(input.leak())?.into(),
        // Dob validation is horribly complex - will clean up when we deprecate old code
        IDK::Dob => DateOfBirth::try_from(Dob::try_from(input)?)?.into(),
        IDK::Ssn4 => Ssn4::from_str(input.leak())?.into(),
        IDK::Ssn9 => Ssn9::from_str(input.leak())?.into(),
        IDK::AddressLine1 => AddressLine::try_from(input.leak_to_string())?.into(),
        IDK::AddressLine2 => AddressLine::try_from(input.leak_to_string())?.into(),
        IDK::City => City::try_from(input.leak_to_string())?.into(),
        IDK::State => State::try_from(input.leak_to_string())?.into(),
        IDK::Zip => Zip::try_from(input.leak_to_string())?.into(),
        IDK::Country => Country::try_from(input.leak_to_string())?.into(),
        IDK::Email => Email::from_str(input.leak())?.into(),
        IDK::PhoneNumber => PhoneNumber::from_str(input.leak())?.into(),
    };
    Ok(result)
}

#[cfg(test)]
mod test {
    use super::IDK::*;
    use super::{clean_and_validate_field, extra_id_kinds};
    use crate::IdentityDataKind as IDK;
    use crate::PiiString;
    use itertools::Itertools;
    use std::collections::HashSet;
    use test_case::test_case;

    #[test_case(&[Ssn4, PhoneNumber, Email], &[])]
    #[test_case(&[FirstName, Ssn4], &[FirstName])]
    #[test_case(&[LastName, Ssn4], &[LastName])]
    #[test_case(&[Ssn4, Ssn9, FirstName, LastName], &[])]
    #[test_case(&[Ssn9, Zip, Country, PhoneNumber, Email, Dob], &[Ssn9])]
    // Only matches partial address
    #[test_case(&[AddressLine1, Zip, Country], &[AddressLine1])]
    #[test_case(&[AddressLine2, Zip, Country], &[AddressLine2])]
    #[test_case(&[AddressLine1, AddressLine2, Zip, Country], &[AddressLine1, AddressLine2])]
    // Complex with lots of missing fields
    #[test_case(&[AddressLine1, AddressLine2, City, State, FirstName, PhoneNumber, Email, Dob], &[AddressLine1, AddressLine2, City, State, FirstName,])]
    fn test_extra_idks(idks: &[IDK], expected_extra: &[IDK]) {
        let extra: HashSet<_> = extra_id_kinds(idks.to_vec()).into_iter().collect();
        let expected: HashSet<_> = expected_extra.iter().cloned().collect();
        assert!(extra.symmetric_difference(&expected).collect_vec().is_empty())
    }

    #[test_case(FirstName, "flerpBlerp" => Some("flerpBlerp".to_owned()))]
    #[test_case(LastName, "flerpBlerp" => Some("flerpBlerp".to_owned()))]
    #[test_case(Dob, "1234" => None)]
    #[test_case(Dob, "2023-13-25" => None)]
    #[test_case(Dob, "2023-12-32" => None)]
    #[test_case(Dob, "2023-12-25" => Some("2023-12-25".to_owned()))]
    #[test_case(Dob, "2019-02-29" => None)]
    #[test_case(Dob, "2020-02-29" => Some("2020-02-29".to_owned()))] // leap year
    #[test_case(Ssn4, "678" => None)]
    #[test_case(Ssn4, "6789" => Some("6789".to_owned()))]
    #[test_case(Ssn9, "123-45-678" => None)]
    #[test_case(Ssn9, "123-45-6789" => Some("123456789".to_owned()))]
    #[test_case(AddressLine1, "100 Enclave Way@" => None)]
    #[test_case(AddressLine1, "100 Enclave Way" => Some("100 Enclave Way".to_owned()))]
    #[test_case(AddressLine2, "#1" => Some("#1".to_owned()))]
    #[test_case(City, "#Footprint" => None)]
    #[test_case(City, "Footprint" => Some("Footprint".to_owned()))]
    #[test_case(State, "#CA" => None)]
    #[test_case(State, "CA" => Some("CA".to_owned()))]
    #[test_case(Zip, "flerp!" => None)]
    #[test_case(Zip, "12345" => Some("12345".to_owned()))]
    #[test_case(Country, "BLERP" => None)]
    #[test_case(Country, "US" => Some("US".to_owned()))]
    #[test_case(Email, "flerp@derp@" => None)]
    #[test_case(Email, "flerp@derp.com" => Some("flerp@derp.com".to_owned()))]
    #[test_case(Email, "flerp@derp.com#sandbox" => Some("flerp@derp.com#sandbox".to_owned()))] // Sandbox email
    #[test_case(PhoneNumber, "flerp" => None)]
    #[test_case(PhoneNumber, "1-555-555-5555" => Some("+15555555555".to_owned()))]
    #[test_case(PhoneNumber, "15555555555#sandbox" => Some("+15555555555#sandbox".to_owned()))] // Sandbox phone
    fn test_clean_and_validate_field(idk: IDK, pii: &str) -> Option<String> {
        clean_and_validate_field(idk, PiiString::new(pii.to_owned()))
            .ok()
            .map(|pii| pii.leak_to_string())
    }
}
