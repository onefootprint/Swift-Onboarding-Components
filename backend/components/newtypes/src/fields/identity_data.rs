use crate::{CollectedDataOption, DataIdentifier, IdentityDataKind as IDK, PiiString};
use crate::{DataValidationError, NtResult};
use either::Either::{Left, Right};
use itertools::Itertools;
use std::collections::{HashMap, HashSet};

use super::parsing::clean_and_validate_field;

type DataRequest = HashMap<DataIdentifier, PiiString>;
type IdentityDataRequest = HashMap<IDK, PiiString>;

#[derive(Debug, Clone, derive_more::Deref, derive_more::DerefMut)]
pub struct IdentityDataUpdate(IdentityDataRequest);

impl IdentityDataUpdate {
    /// Composes a new IdentityDataUpdate with cleaned and validated data, and returns any other
    /// non-identity key-value pairs included in the input DataRequest
    pub fn new(map: DataRequest) -> NtResult<(Self, DataRequest)> {
        let (id_data, other_data): (HashMap<_, _>, HashMap<_, _>) =
            map.into_iter().partition_map(|(k, v)| match k {
                DataIdentifier::Id(idk) => Left((idk, v)),
                k => Right((k, v)),
            });

        let clean_id_data = clean_and_validate_id_data(id_data)?;
        let id_update = Self(clean_id_data);
        Ok((id_update, other_data))
    }

    pub fn into_inner(self) -> IdentityDataRequest {
        self.0
    }
}

fn clean_and_validate_id_data(id_data: IdentityDataRequest) -> NtResult<IdentityDataRequest> {
    // Custom case to always populate ssn4 if we have ssn9.
    // TODO clean this up
    let mut id_data = id_data;
    if let Some(ssn9) = id_data.get(&IDK::Ssn9) {
        #[allow(clippy::map_entry)]
        if !id_data.contains_key(&IDK::Ssn4) {
            let ssn4 = PiiString::new(ssn9.leak().chars().skip(ssn9.leak().len() - 4).collect());
            id_data.insert(IDK::Ssn4, ssn4);
        }
    }

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
    let represented_idks: HashSet<_> = cdos.into_iter().flat_map(|cdo| cdo.attributes()).collect();
    let id_kinds: HashSet<_> = id_kinds.into_iter().collect();
    // Keys given minus represented keys
    id_kinds.difference(&represented_idks).cloned().collect_vec()
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
    fn test_clean_and_validate_field(idk: IDK, pii: &str) -> Option<String> {
        clean_and_validate_field(idk, PiiString::new(pii.to_owned()))
            .ok()
            .map(|pii| pii.leak_to_string())
    }
}
