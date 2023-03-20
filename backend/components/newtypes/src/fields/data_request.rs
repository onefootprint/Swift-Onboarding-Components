use crate::{CollectedDataOption, DataIdentifier, IsDataIdentifierDiscriminant, PiiString};
use crate::{DataValidationError, NtResult};
use either::Either::{Left, Right};
use itertools::Itertools;
use std::clone::Clone;
use std::collections::{HashMap, HashSet};

type DataIdentifierRequest = HashMap<DataIdentifier, PiiString>;
/// Unvalidated data request, a HashMap of T -> PiiString where T is a subset of DataIdentifier
type RawDataRequest<T> = HashMap<T, PiiString>;

#[derive(Debug, Clone, derive_more::Deref, derive_more::DerefMut)]
/// Validated DataRequest of T -> PiiString where T is a subet of DataIdentifier
pub struct DataRequest<T>(RawDataRequest<T>);

impl<T> DataRequest<T> {
    pub fn into_inner(self) -> RawDataRequest<T> {
        self.0
    }
}

#[derive(Debug, Copy, Clone)]
pub struct ParseOptions {
    /// When true, performs some front-loaded validation that vendors normally perform in order to
    /// try to prevent vendors rejecting our request with a 400.
    pub for_bifrost: bool,
    /// Don't raise errors for trying to add superfluous fields to the vault.
    /// Useful to allow speculatively validating data that is only a part of a CDO
    pub allow_extra_field_errors: bool,
}

impl<T> DataRequest<T>
where
    T: IsDataIdentifierDiscriminant,
{
    /// Parses, cleans, and validates DataIdentifiers of type T into a DataRequest<T> and returns
    /// the remaining unused data
    pub fn new(map: DataIdentifierRequest, opts: ParseOptions) -> NtResult<(Self, DataIdentifierRequest)> {
        let (data, other_data): (HashMap<_, _>, HashMap<_, _>) =
            map.into_iter()
                .partition_map(|(k, v)| match T::try_from(k.clone()) {
                    Ok(identifier) => Left((identifier, v)),
                    Err(_) => Right((k, v)),
                });

        let clean_id_data = Self::clean_and_validate_data(data, opts)?;
        let id_update = Self(clean_id_data);
        Ok((id_update, other_data))
    }

    fn clean_and_validate_data(data: RawDataRequest<T>, opts: ParseOptions) -> NtResult<RawDataRequest<T>> {
        // Make sure all keys provided are parts of coherent CollectedDataOptions.
        // For ex, can't specify FirstName without LastName
        if !opts.allow_extra_field_errors {
            let keys = data.keys().cloned().collect_vec();
            let extra_dis = Self::extra_keys(keys)
                .into_iter()
                .filter_map(|x| x.parent().map(|p| (p, x.into())))
                .collect_vec();
            if !extra_dis.is_empty() {
                return Err(DataValidationError::ExtraFieldError(extra_dis).into());
            }
        }

        // Iterate through keys, use validation function per key and keep track of errors
        let (cleaned_id_data, errors): (HashMap<_, _>, HashMap<_, _>) =
            data.into_iter()
                .partition_map(|(k, v)| match k.validate(v, opts.for_bifrost) {
                    Ok(v) => Left((k, v)),
                    Err(v) => Right((k.into(), v)),
                });
        if !errors.is_empty() {
            return Err(DataValidationError::FieldValidationError(errors).into());
        }

        Ok(cleaned_id_data)
    }

    /// Calculates the unnecessary keys that aren't part of any coherent CDO.
    /// For example, if you provide FirstName without LastName, we can't save only your FirstName
    fn extra_keys(keys: Vec<T>) -> Vec<T> {
        // Get all the CDOs represented in here
        let cdos = CollectedDataOption::list_from(keys.clone());
        let represented_identifiers: HashSet<T> = cdos.into_iter().flat_map(|cdo| cdo.attributes()).collect();
        // Keys given minus represented keys
        let keys: HashSet<T> = keys.into_iter().collect();
        keys.difference(&represented_identifiers).cloned().collect_vec()
    }
}

#[cfg(test)]
mod test {
    use super::DataRequest;
    use crate::IdentityDataKind as IDK;
    use itertools::Itertools;
    use std::collections::HashSet;
    use test_case::test_case;
    use IDK::*;

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
        let extra: HashSet<_> = DataRequest::<IDK>::extra_keys(idks.to_vec())
            .into_iter()
            .collect();
        let expected: HashSet<_> = expected_extra.iter().cloned().collect();
        assert!(extra.symmetric_difference(&expected).collect_vec().is_empty())
    }
}
