use crate::{
    CollectedDataOption, DataIdentifier, Error, IdentityDataKind as IDK, PiiString, Validate, VdKind,
};
use crate::{DataValidationError, NtResult};
use either::Either::{Left, Right};
use itertools::Itertools;
use std::clone::Clone;
use std::collections::{HashMap, HashSet};

type DataIdentifierRequest = HashMap<DataIdentifier, PiiString>;

#[derive(Debug, Clone, derive_more::Deref, derive_more::DerefMut)]
/// A parsed and validated DataRequest of DataIdentifier -> PiiString
pub struct DataRequest(DataIdentifierRequest);

impl DataRequest {
    pub fn into_inner(self) -> DataIdentifierRequest {
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

impl DataRequest {
    /// Parses, cleans, and validates DataIdentifiers of type T into a DataRequest<T> and returns
    /// the remaining unused data
    pub fn clean_and_validate(map: DataIdentifierRequest, opts: ParseOptions) -> NtResult<Self> {
        let mut map = map;
        // Custom logic to always populate ssn4 if ssn9 is provided
        if let Some(ssn9) = map.get(&IDK::Ssn9.into()) {
            #[allow(clippy::map_entry)]
            if !map.contains_key(&IDK::Ssn4.into()) {
                let ssn4 = PiiString::new(ssn9.leak().chars().skip(ssn9.leak().len() - 4).collect());
                map.insert(IDK::Ssn4.into(), ssn4);
            }
        }

        let (data, err_data): (HashMap<_, _>, HashMap<_, _>) =
            map.into_iter()
                .partition_map(|(k, v)| match VdKind::try_from(k.clone()) {
                    // Only take the data that fits in the Vd table
                    // TODO should we make the DataRequest a VdKind -> PiiString
                    Ok(_) => Left((k, v)),
                    Err(_) => Right((k, v)),
                });
        if let Some(k) = err_data.into_iter().next() {
            return Err(Error::Custom(format!("Cannot put key {}", k.0)));
        }

        let clean_data = Self::clean_and_validate_data(data, opts)?;
        let update = Self(clean_data);
        Ok(update)
    }

    fn clean_and_validate_data(
        data: DataIdentifierRequest,
        opts: ParseOptions,
    ) -> NtResult<DataIdentifierRequest> {
        // Make sure all keys provided are parts of coherent CollectedDataOptions.
        // For ex, can't specify FirstName without LastName
        // TODO this validation should happen at write time - you should be able to add only a last name if the full name already exists in the vault
        if !opts.allow_extra_field_errors {
            let keys = data.keys().cloned().collect_vec();
            let extra_dis = Self::extra_keys(keys)
                .into_iter()
                .filter_map(|x| x.parent().map(|p| (p, x)))
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
                    Err(v) => Right((k, v)),
                });
        if !errors.is_empty() {
            return Err(DataValidationError::FieldValidationError(errors).into());
        }

        Ok(cleaned_id_data)
    }

    /// Calculates the unnecessary keys that aren't part of any coherent CDO.
    /// For example, if you provide FirstName without LastName, we can't save only your FirstName
    fn extra_keys(keys: Vec<DataIdentifier>) -> Vec<DataIdentifier> {
        // Get all the CDOs represented in here
        let cdos = CollectedDataOption::list_from(keys.clone());
        let represented_identifiers: HashSet<_> = cdos
            .into_iter()
            .flat_map(|cdo| cdo.data_identifiers().unwrap_or_default())
            .collect();
        // Keys given minus represented keys
        let keys: HashSet<_> = keys.into_iter().collect();
        keys.difference(&represented_identifiers).cloned().collect_vec()
    }

    pub fn assert_no_id_data(&self) -> NtResult<()> {
        let id_keys = self
            .keys()
            .filter(|di| matches!(di, DataIdentifier::Id(_) | DataIdentifier::InvestorProfile(_)))
            .collect();
        Self::assert_empty(id_keys)?;
        Ok(())
    }

    /// Returns an Err if this request contains business data
    pub fn assert_no_business_data(&self) -> NtResult<()> {
        let business_keys = self
            .keys()
            .filter(|di| matches!(di, DataIdentifier::Business(_)))
            .collect();
        Self::assert_empty(business_keys)
    }

    fn assert_empty(values: Vec<&DataIdentifier>) -> NtResult<()> {
        if !values.is_empty() {
            let field_errors = values
                .into_iter()
                .map(|di| (di.clone(), Error::IncompatibleDataIdentifier))
                .collect();
            return Err(crate::DataValidationError::FieldValidationError(field_errors).into());
        }
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::DataRequest;
    use crate::{DataIdentifier, IdentityDataKind as IDK};
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
        let dis = idks.iter().map(|idk| DataIdentifier::from(*idk)).collect();
        let expected = expected_extra
            .iter()
            .map(|idk| DataIdentifier::from(*idk))
            .collect();
        let extra: HashSet<_> = DataRequest::extra_keys(dis).into_iter().collect();
        assert!(extra.symmetric_difference(&expected).collect_vec().is_empty())
    }
}
