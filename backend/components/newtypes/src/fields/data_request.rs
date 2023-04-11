use crate::fingerprinter::{Fingerprinter, GlobalFingerprintKind};
use crate::{
    CollectedDataOption, DataIdentifier, DataLifetimeKind, Error, Fingerprint, FingerprintScopeKind,
    IdentityDataKind as IDK, PiiString, TenantId, Validate, VdKind,
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
    pub kind: DataLifetimeKind,
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
    pub fn decompose(self) -> (DataIdentifierRequest, T) {
        (self.data, self.fingerprints)
    }
}

#[derive(Debug, Copy, Clone)]
pub struct ParseOptions {
    /// When true, performs some front-loaded validation that vendors normally perform in order to
    /// try to prevent vendors rejecting our request with a 400.
    pub for_bifrost: bool,
    /// Don't raise errors for dangling keys.
    /// Useful to allow speculatively validating data for a partial CDO
    pub allow_dangling_keys: bool,
}

impl ParseOptions {
    pub fn for_bifrost() -> Self {
        Self {
            for_bifrost: true,
            allow_dangling_keys: false,
        }
    }

    pub fn for_non_portable() -> Self {
        Self {
            for_bifrost: false,
            allow_dangling_keys: false,
        }
    }
}

impl DataRequest<()> {
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
        if !opts.allow_dangling_keys && !dangling_keys.is_empty() {
            let err = Error::from(DataValidationError::ExtraFieldError(dangling_keys));
            return Err(err);
        }

        // Clean and validate each individual piece of data
        let (cleaned_data, errors): (HashMap<_, _>, HashMap<_, _>) =
            data.into_iter()
                .partition_map(|(k, v)| match k.validate(v, opts.for_bifrost) {
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

    /// Given a DataRequest, computes fingerprints for all relevant, fingerprintable pieces of data
    /// and returns a new DataRequest with the Fingerprints populated.
    /// This gives us type safety that fingerprints are provided to the VW utils that add data to a vault
    pub async fn build_tenant_fingerprints<F: Fingerprinter>(
        self,
        fingerprinter: &F,
        tenant_id: &TenantId,
    ) -> Result<DataRequest<Fingerprints>, F::Error> {
        let (data, dlks): (Vec<_>, Vec<DataLifetimeKind>) = self
            .data
            .iter()
            .filter_map(|(di, pii)| {
                let dlk: DataLifetimeKind = di.clone().try_into().ok()?;
                di.is_fingerprintable().then_some((((di, tenant_id), pii), dlk))
            })
            .unzip();

        let fingerprints = fingerprinter.compute_fingerprints(data.as_slice()).await?;

        let fingerprints = dlks
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
            .map(|(g, _)| g.data_lifetime_kind())
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
