use crate::data_identifier::ValidationError;
use crate::fingerprinter::{Fingerprinter, GlobalFingerprintKind};
use crate::{
    CollectedDataOption, DataIdentifier, Error, Fingerprint, FingerprintScopeKind, PiiString, PiiValue,
    StorageType, TenantId, Validate, VaultKind,
};
use crate::{DataValidationError, NtResult};
use either::Either::{Left, Right};
use itertools::Itertools;
use std::clone::Clone;
use std::collections::{HashMap, HashSet};
use strum::IntoEnumIterator;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct FingerprintRequest {
    pub kind: DataIdentifier,
    pub fingerprint: Fingerprint,
    pub scope: FingerprintScopeKind,
}

pub type Fingerprints = HashSet<FingerprintRequest>;

#[derive(Debug, Clone, derive_more::Deref, derive_more::DerefMut)]
/// A parsed and validated DataRequest of DataIdentifier -> PiiString
pub struct DataRequest<T> {
    #[deref]
    #[deref_mut]
    data: HashMap<DataIdentifier, PiiString>,
    fingerprints: T,
}

impl<T> DataRequest<T> {
    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }

    pub fn decompose(self) -> (HashMap<DataIdentifier, PiiString>, T) {
        (self.data, self.fingerprints)
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
        let map = map.into_iter().map(|(k, v)| (k, v.into())).collect();
        Self::clean_and_validate(map, args)
    }

    /// Parses, cleans, and validates DataIdentifiers of type T into a DataRequest<T> and returns
    /// the remaining unused data
    pub fn clean_and_validate(map: HashMap<DataIdentifier, PiiValue>, args: ValidateArgs) -> NtResult<Self> {
        let unallowed_entries: HashMap<_, _> = map
            .keys()
            .filter_map(|di| {
                let err = if di.storage_type() != StorageType::VaultData {
                    Some(ValidationError::CannotVault.into())
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
        use crate::IdentityDataKind as IDK;
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
        // Can just use AllData to grab the original types of each piece of data.
        // we would then miss the types of derived data, though
        let all_data = map.clone();
        let (cleaned_data, errors): (Vec<_>, HashMap<_, _>) =
            map.into_iter()
                .partition_map(|(k, v)| match k.clone().validate(v, args, &all_data) {
                    Ok(v) => Left(v),
                    Err(err) => Right((k, err)),
                });
        if !errors.is_empty() {
            return Err(DataValidationError::FieldValidationError(errors).into());
        }

        let cleaned_data = cleaned_data.into_iter().flatten().collect();
        let request = Self {
            data: cleaned_data,
            // Initially create the request with no fingerprints - they need to be added with an
            // async function
            fingerprints: (),
        };
        Ok(request)
    }
}

impl<T> DataRequest<T> {
    /// Enforce that this update only has the allowable set of DIs based on the vault kind
    pub fn assert_allowable_identifiers(&self, kind: VaultKind) -> NtResult<()> {
        let disallowed_keys = self.keys().filter(|di| !di.is_allowed_for(kind)).collect_vec();
        if !disallowed_keys.is_empty() {
            let field_errors = disallowed_keys
                .into_iter()
                .map(|di| (di.clone(), Error::IncompatibleDataIdentifier))
                .collect();
            return Err(crate::DataValidationError::FieldValidationError(field_errors).into());
        }
        Ok(())
    }

    /// Given a DataRequest, computes fingerprints for all relevant, fingerprintable pieces of data
    /// and returns a new DataRequest with the Fingerprints populated.
    /// This gives us type safety that fingerprints are provided to the VW utils that add data to a vault
    pub async fn build_tenant_fingerprints<F: Fingerprinter>(
        self,
        fingerprinter: &F,
        tenant_id: &TenantId,
    ) -> Result<DataRequest<Fingerprints>, F::Error> {
        let (data, dis): (Vec<_>, Vec<DataIdentifier>) = self
            .data
            .iter()
            .filter_map(|(di, pii)| {
                di.is_fingerprintable()
                    .then_some((((di, tenant_id), pii), di.clone()))
            })
            .unzip();

        let fingerprints = fingerprinter.compute_fingerprints(data.as_slice()).await?;

        let fingerprints = dis
            .into_iter()
            .zip(fingerprints)
            .map(|(kind, fingerprint)| FingerprintRequest {
                kind,
                fingerprint,
                scope: FingerprintScopeKind::Tenant,
            })
            .collect();

        let request = DataRequest {
            data: self.data,
            fingerprints,
        };
        Ok(request)
    }

    pub async fn build_global_fingerprints<F: Fingerprinter>(
        self,
        fingerprinter: &F,
        is_fixture: bool,
    ) -> Result<DataRequest<Fingerprints>, F::Error> {
        let data_to_fingerprint = if !is_fixture {
            GlobalFingerprintKind::iter()
                .filter_map(|g| self.data.get(&g.data_identifier()).map(|pii| (g, pii)))
                .collect::<Vec<_>>()
        } else {
            vec![]
        };

        let global_fingperprints = fingerprinter
            .compute_fingerprints(data_to_fingerprint.as_slice())
            .await?;

        let fingerprints = data_to_fingerprint
            .into_iter()
            .map(|(g, _)| g.data_identifier())
            .zip(global_fingperprints)
            .map(|(kind, fingerprint)| FingerprintRequest {
                fingerprint,
                kind,
                scope: FingerprintScopeKind::Global,
            })
            .collect();

        let request = DataRequest {
            data: self.data,
            fingerprints,
        };
        Ok(request)
    }

    /// Used in cases where we don't want to asynchronously generate fingerprints for the underlying data
    pub fn manual_fingerprints(self, fingerprints: Fingerprints) -> DataRequest<Fingerprints> {
        DataRequest {
            data: self.data,
            fingerprints,
        }
    }

    pub fn no_fingerprints(self) -> DataRequest<Fingerprints> {
        DataRequest {
            data: self.data,
            fingerprints: HashSet::new(),
        }
    }
}
