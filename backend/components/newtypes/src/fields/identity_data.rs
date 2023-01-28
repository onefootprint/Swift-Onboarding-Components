use crate::{CollectedDataOption, DataIdentifier, IdentityDataKind as IDK, PiiString};
use crate::{DataValidationError, NtResult};
use either::Either::{Left, Right};
use itertools::Itertools;
use std::collections::{HashMap, HashSet};

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
    // TODO real per-field validation
    let result = match idk {
        IDK::FirstName => input,
        IDK::LastName => input,
        IDK::Dob => input,
        IDK::Ssn4 => input,
        IDK::Ssn9 => input,
        IDK::AddressLine1 => input,
        IDK::AddressLine2 => input,
        IDK::City => input,
        IDK::State => input,
        IDK::Zip => input,
        IDK::Country => input,
        IDK::Email => input,
        IDK::PhoneNumber => input,
    };
    Ok(result)
}

#[cfg(test)]
mod test {
    use super::IDK::*;
    use super::*;
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
}
