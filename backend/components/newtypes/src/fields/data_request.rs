use crate::{
    data_identifier::DiValidationError, fingerprinter::Fingerprinter, CleanAndValidate, CollectedDataOption,
    DataIdentifier, DataValidationError, DeriveValues, Error, Fingerprint, FingerprintScopeKind,
    IdentityDataKind as IDK, NtResult, PiiJsonValue, PiiString, StorageType, TenantId,
};
use either::Either::{Left, Right};
use itertools::{chain, Itertools};
use std::{clone::Clone, collections::HashMap};

#[derive(Debug, Clone)]
pub struct FingerprintRequest {
    pub kind: DataIdentifier,
    pub fingerprint: Fingerprint,
    pub scope: FingerprintScopeKind,
}

pub type Fingerprints = Vec<FingerprintRequest>;

#[derive(Debug, Clone, derive_more::Deref, derive_more::DerefMut)]
/// A parsed and validated DataRequest of DataIdentifier -> PiiString
pub struct DataRequest<T> {
    #[deref]
    #[deref_mut]
    data: HashMap<DataIdentifier, PiiString>,
    json_fields: Vec<DataIdentifier>,
    fingerprints: T,
}

impl<T> DataRequest<T> {
    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }

    pub fn decompose(self) -> (HashMap<DataIdentifier, PiiString>, Vec<DataIdentifier>, T) {
        (self.data, self.json_fields, self.fingerprints)
    }
}

#[derive(Debug, Copy, Clone)]
pub struct ValidateArgs {
    /// When true, performs some front-loaded validation that vendors normally perform in order to
    /// try to prevent vendors rejecting our request with a 400.
    pub for_bifrost: bool,
    /// Don't raise errors for dangling keys.
    /// Useful to allow speculatively validating data for a partial CDO
    pub allow_dangling_keys: bool,
    /// Don't raise errors for card validation problems
    pub ignore_luhn_validation: bool,
    /// When true, validates as production data. When false, validates as sandbox data
    pub is_live: bool,
}

impl ValidateArgs {
    pub fn for_bifrost(is_live: bool) -> Self {
        Self {
            ignore_luhn_validation: false,
            for_bifrost: true,
            allow_dangling_keys: false,
            is_live,
        }
    }

    pub fn for_non_portable(is_live: bool) -> Self {
        Self {
            ignore_luhn_validation: false,
            for_bifrost: false,
            allow_dangling_keys: true,
            is_live,
        }
    }
}

#[cfg(test)]
impl ValidateArgs {
    pub fn for_tests() -> Self {
        Self {
            ignore_luhn_validation: false,
            for_bifrost: false,
            allow_dangling_keys: false,
            is_live: true,
        }
    }
}

impl DataRequest<()> {
    pub fn clean_and_validate_str(
        map: HashMap<DataIdentifier, PiiString>,
        args: ValidateArgs,
    ) -> NtResult<Self> {
        let map = map
            .into_iter()
            .map(|(k, v)| (k, PiiJsonValue::from_piistring(v)))
            .collect();
        Self::clean_and_validate(map, args)
    }

    /// Parses, cleans, and validates DataIdentifiers of type T into a DataRequest<T> and returns
    /// the remaining unused data
    pub fn clean_and_validate(
        map: HashMap<DataIdentifier, PiiJsonValue>,
        args: ValidateArgs,
    ) -> NtResult<Self> {
        let unallowed_entries: HashMap<_, _> = map
            .keys()
            .filter_map(|di| {
                let err = if di.storage_type() != StorageType::VaultData {
                    Some(DiValidationError::CannotVault.into())
                } else {
                    None
                };
                err.map(|e| (di.clone(), e))
            })
            .collect();
        if !unallowed_entries.is_empty() {
            return Err(DataValidationError::FieldValidationError(unallowed_entries).into());
        }

        // Then, validate that there are no "dangling" extra keys in this request.
        // For example, don't allow updating only AddressLine1 - need the whole address
        let new_dis = map.keys().cloned().collect_vec();
        let dangling_keys = CollectedDataOption::dangling_identifiers(new_dis);
        if !args.allow_dangling_keys && !dangling_keys.is_empty() {
            let err = Error::from(DataValidationError::ExtraFieldError(dangling_keys));
            return Err(err);
        }

        // Remove any entries that will be overwritten with derived entries.
        // TODO: I don't love that this has to be independently maintained. But all except ssn4
        // have protection - ssn4 is unique because it is both derived _and_ can be written
        let derived_dis = map
            .keys()
            .flat_map(|di| match di {
                DataIdentifier::Id(IDK::Ssn9) => vec![IDK::Ssn4.into()],
                _ => vec![],
            })
            .collect_vec();
        let map: HashMap<_, _> = map
            .into_iter()
            .filter(|(k, _)| !derived_dis.contains(k))
            .collect();

        // Clean and validate each individual piece of data
        let all_data = map.clone();
        let (cleaned_data, errors): (Vec<_>, HashMap<_, _>) = map
            .into_iter()
            .map(|(k, v)| {
                // For fields added via bifrost, trim unnecessary whitespaces
                if args.for_bifrost && matches!(k, DataIdentifier::Id(_) | DataIdentifier::Business(_)) {
                    (k, v.trim_whitespace())
                } else {
                    (k, v)
                }
            })
            .partition_map(|(k, v)| match k.clone().clean_and_validate(v, args, &all_data) {
                Ok(v) => Left(v),
                Err(err) => Right((k, err)),
            });
        if !errors.is_empty() {
            return Err(DataValidationError::FieldValidationError(errors).into());
        }

        let derived_data = cleaned_data
            .iter()
            .flat_map(|cleaned| cleaned.derive_values())
            .map(Into::into)
            .collect_vec();
        let cleaned_and_derived_data = chain(cleaned_data, derived_data).collect_vec();

        // NOTE: we're missing any derived fields that are JSON. But we don't have any of those yet...
        let json_fields = all_data
            .into_iter()
            .filter(|(_, v)| !v.is_string())
            .map(|(k, _)| k)
            .collect();
        let request = Self {
            data: cleaned_and_derived_data
                .into_iter()
                .map(|div| (div.di, div.value))
                .collect(),
            // Initially create the request with no fingerprints - they need to be added with an
            // async function
            json_fields,
            fingerprints: (),
        };
        Ok(request)
    }
}

impl<T> DataRequest<T> {
    /// Given a DataRequest, computes fingerprints for all relevant, fingerprintable pieces of data
    /// and returns a new DataRequest with the Fingerprints populated.
    /// This gives us type safety that fingerprints are provided to the VW utils that add data to a vault
    pub async fn build_fingerprints<F: Fingerprinter>(
        self,
        fingerprinter: &F,
        tenant_id: &TenantId,
    ) -> Result<DataRequest<Fingerprints>, F::Error> {
        let data_to_fingerprint: Vec<_> = self
            .data
            .iter()
            .flat_map(|(di, pii)| di.get_fingerprint_payload(pii, Some(tenant_id)))
            .collect();

        // TODO make composite fingerprint if we have all the data
        // then one day decrypt to get all the data

        let fingerprints = fingerprinter.compute_fingerprints(data_to_fingerprint).await?;

        let fingerprints = fingerprints
            .into_iter()
            .map(|(scope, fingerprint)| FingerprintRequest {
                kind: scope.data_identifier(),
                fingerprint,
                scope: scope.kind(),
            })
            .collect();

        let request = DataRequest {
            data: self.data,
            json_fields: self.json_fields,
            fingerprints,
        };
        Ok(request)
    }

    /// Used in cases where we don't want to asynchronously generate fingerprints for the underlying data
    pub fn manual_fingerprints(self, fingerprints: Fingerprints) -> DataRequest<Fingerprints> {
        DataRequest {
            data: self.data,
            json_fields: self.json_fields,
            fingerprints,
        }
    }

    /// Backdoor to not attach fingerprints to the DataRequest for cases where we're just using the
    /// DataRequest for validation
    pub fn no_fingerprints_for_validation(self) -> DataRequest<Fingerprints> {
        DataRequest {
            data: self.data,
            json_fields: self.json_fields,
            fingerprints: vec![],
        }
    }
}
