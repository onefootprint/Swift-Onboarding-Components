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
    pub fn new(map: DataRequest, for_bifrost: bool) -> NtResult<(Self, DataRequest)> {
        let (id_data, other_data): (HashMap<_, _>, HashMap<_, _>) =
            map.into_iter().partition_map(|(k, v)| match k {
                DataIdentifier::Id(idk) => Left((idk, v)),
                k => Right((k, v)),
            });

        let clean_id_data = clean_and_validate_id_data(id_data, for_bifrost)?;
        let id_update = Self(clean_id_data);
        Ok((id_update, other_data))
    }

    pub fn into_inner(self) -> IdentityDataRequest {
        self.0
    }
}

fn clean_and_validate_id_data(
    id_data: IdentityDataRequest,
    for_bifrost: bool,
) -> NtResult<IdentityDataRequest> {
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
            .partition_map(|(k, v)| match clean_and_validate_field(k, v, for_bifrost) {
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
    let represented_idks: HashSet<_> = cdos
        .into_iter()
        .flat_map(|cdo| cdo.identity_attributes().unwrap_or_default())
        .collect();
    let id_kinds: HashSet<_> = id_kinds.into_iter().collect();
    // Keys given minus represented keys
    id_kinds.difference(&represented_idks).cloned().collect_vec()
}

#[cfg(test)]
mod test {
    use super::extra_id_kinds;
    use super::IDK::*;
    use crate::IdentityDataKind as IDK;
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
}
