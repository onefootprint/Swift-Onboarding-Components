use crate::fingerprinter::{Fingerprinter, GlobalFingerprintKind};
use crate::{
    CardDataKind as CDK, CardInfo, CollectedDataOption, DataIdentifier, Error, Fingerprint,
    FingerprintScopeKind, IdentityDataKind as IDK, PiiString, TenantId, Validate, VaultKind, VdKind,
};
use crate::{DataValidationError, NtResult};
use either::Either::{Left, Right};
use itertools::Itertools;
use std::clone::Clone;
use std::collections::{HashMap, HashSet};
use strum::IntoEnumIterator;

type DataIdentifierRequest = HashMap<DataIdentifier, PiiString>;

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
    data: DataIdentifierRequest,
    fingerprints: T,
}

impl<T> DataRequest<T> {
    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }
}

impl<T> DataRequest<T> {
    pub fn decompose(self) -> (DataIdentifierRequest, T) {
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
    /// When true, validates as production data. When false, validates as sandbox data
    pub is_live: bool,
}

impl ValidateArgs {
    pub fn for_bifrost(is_live: bool) -> Self {
        Self {
            for_bifrost: true,
            allow_dangling_keys: false,
            is_live,
        }
    }

    pub fn for_non_portable(is_live: bool) -> Self {
        Self {
            for_bifrost: false,
            allow_dangling_keys: false,
            is_live,
        }
    }
}

#[cfg(test)]
impl ValidateArgs {
    pub fn for_tests() -> Self {
        Self {
            for_bifrost: false,
            allow_dangling_keys: false,
            is_live: true,
        }
    }
}

/// Given an entry in a DataIdentifierRequest, determines if we should add any other derived
/// entries to the DataIdentifierRequest that are a function of other DIs
fn derived_entry(di: &DataIdentifier, v: &PiiString) -> Option<(DataIdentifier, PiiString)> {
    match di {
        // Autopopulate Ssn4 if we have Ssn9
        DataIdentifier::Id(IDK::Ssn9) => {
            let ssn4 = PiiString::new(v.leak().chars().skip(v.leak().len() - 4).collect());
            Some((IDK::Ssn4.into(), ssn4))
        }
        // Autopopulate CDK::Last4 if we have CDK::Number
        DataIdentifier::Card(CardInfo {
            alias,
            kind: CDK::Number,
        }) => {
            let last4 = PiiString::new(v.leak().chars().skip(v.leak().len() - 4).collect());
            let di = CardInfo {
                alias: alias.clone(),
                kind: CDK::Last4,
            }
            .into();
            Some((di, last4))
        }
        _ => None,
    }
}

impl DataRequest<()> {
    /// Parses, cleans, and validates DataIdentifiers of type T into a DataRequest<T> and returns
    /// the remaining unused data
    pub fn clean_and_validate(map: DataIdentifierRequest, args: ValidateArgs) -> NtResult<Self> {
        let derived_entries = map.iter().filter_map(|(di, v)| derived_entry(di, v));
        // Purposefully overlay derived entries on top of existing entries in order to overwrite
        // an ssn4 that's provided and might not match the given ssn9
        let map: DataIdentifierRequest = map.clone().into_iter().chain(derived_entries).collect();

        // Only take the data that fits in the Vd table
        // TODO should we make the DataRequest a VdKind -> PiiString
        let (data, err_data): (HashMap<_, _>, HashMap<_, _>) =
            map.into_iter()
                .partition_map(|(k, v)| match VdKind::try_from(k.clone()) {
                    Ok(_) => Left((k, v)),
                    Err(_) => Right((k, v)),
                });
        if let Some(k) = err_data.into_iter().next() {
            return Err(Error::Custom(format!("Cannot put key {}", k.0)));
        }

        // Then, validate that there are no "dangling" extra keys in this request.
        // For example, don't allow updating only AddressLine1 - need the whoel address
        let new_dis = data.keys().cloned().collect_vec();
        let dangling_keys = CollectedDataOption::dangling_identifiers(new_dis);
        if !args.allow_dangling_keys && !dangling_keys.is_empty() {
            let err = Error::from(DataValidationError::ExtraFieldError(dangling_keys));
            return Err(err);
        }

        // Clean and validate each individual piece of data
        let (cleaned_data, errors): (HashMap<_, _>, HashMap<_, _>) =
            data.into_iter()
                .partition_map(|(k, v)| match k.validate(v, args) {
                    Ok(v) => Left((k, v)),
                    Err(v) => Right((k, v)),
                });
        if !errors.is_empty() {
            return Err(DataValidationError::FieldValidationError(errors).into());
        }

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
    ) -> Result<DataRequest<Fingerprints>, F::Error> {
        let data_to_fingerprint = GlobalFingerprintKind::iter()
            .filter_map(|g| self.data.get(&g.data_identifier()).map(|pii| (g, pii)))
            .collect::<Vec<_>>();

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
