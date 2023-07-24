use crate::data_identifier::ValidationError;
use crate::fingerprinter::{Fingerprinter, GlobalFingerprintKind};
use crate::{
    CardDataKind as CDK, CardInfo, CardIssuer, CollectedDataOption, DataIdentifier, Error, Fingerprint,
    FingerprintScopeKind, IdentityDataKind as IDK, PiiString, StorageType, TenantId, Validate, VaultKind,
};
use crate::{DataValidationError, NtResult};
use card_validate::Validate as CardValidate;
use either::Either::{Left, Right};
use itertools::Itertools;
use std::clone::Clone;
use std::collections::{HashMap, HashSet};
use strum::IntoEnumIterator;

pub type DataIdentifierRequest = HashMap<DataIdentifier, PiiString>;

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
    /// Don't raise errors for card validation problems
    pub ignore_card_validation: bool,
    /// When true, validates as production data. When false, validates as sandbox data
    pub is_live: bool,
}

impl ValidateArgs {
    pub fn for_bifrost(is_live: bool) -> Self {
        Self {
            ignore_card_validation: false,
            for_bifrost: true,
            allow_dangling_keys: false,
            is_live,
        }
    }

    pub fn for_non_portable(is_live: bool) -> Self {
        Self {
            ignore_card_validation: false,
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
            ignore_card_validation: false,
            for_bifrost: false,
            allow_dangling_keys: false,
            is_live: true,
        }
    }
}

/// Given an entry in a DataIdentifierRequest, determines if we should add any other derived
/// entries to the DataIdentifierRequest that are a function of other DIs
fn derived_entry(di: &DataIdentifier, v: &PiiString) -> Vec<(DataIdentifier, PiiString)> {
    match di {
        // Autopopulate Ssn4 if we have Ssn9
        DataIdentifier::Id(IDK::Ssn9) => {
            let ssn4 = PiiString::new(v.leak().chars().skip(v.leak().len() - 4).collect());
            vec![(IDK::Ssn4.into(), ssn4)]
        }
        // Autopopulate CDK last4 and exp_month/year
        DataIdentifier::Card(CardInfo { alias, kind }) => match kind {
            CDK::Number => {
                let last4: PiiString = PiiString::new(v.leak().chars().skip(v.leak().len() - 4).collect());
                let last4_di = CardInfo {
                    alias: alias.clone(),
                    kind: CDK::Last4,
                }
                .into();
                let last4_entry = Some((last4_di, last4));
                // If we can't parse the number, silently fail to derive the issuer - we'll get a
                // nicer error later on when we try to parse the number
                let issuer_entry = CardValidate::from(v.leak())
                    .ok()
                    .map(|v| CardIssuer::from(v.card_type))
                    .map(|issuer| {
                        let di = CardInfo {
                            alias: alias.clone(),
                            kind: CDK::Issuer,
                        }
                        .into();
                        (di, PiiString::new(issuer.to_string()))
                    });
                vec![last4_entry, issuer_entry].into_iter().flatten().collect()
            }
            CDK::Expiration => {
                // TODO: derivation should encapsulate validation so we don't need this check here
                let Some(expiration) = crate::CardExpiration::validate(v).ok() else {
                    return vec![];
                };

                vec![
                    (
                        CardInfo {
                            alias: alias.clone(),
                            kind: CDK::ExpMonth,
                        }
                        .into(),
                        expiration.month,
                    ),
                    (
                        CardInfo {
                            alias: alias.clone(),
                            kind: CDK::ExpYear,
                        }
                        .into(),
                        expiration.year,
                    ),
                ]
            }
            _ => vec![],
        },
        _ => vec![],
    }
}

impl DataRequest<()> {
    /// Parses, cleans, and validates DataIdentifiers of type T into a DataRequest<T> and returns
    /// the remaining unused data
    pub fn clean_and_validate(map: DataIdentifierRequest, args: ValidateArgs) -> NtResult<Self> {
        let unallowed_derived_dis: HashMap<_, _> = map
            .keys()
            .filter_map(|di| {
                let err = if di.is_derived() {
                    Some(ValidationError::CannotSpecifyDerivedEntry.into())
                } else if di.storage_type() != StorageType::VaultData {
                    Some(ValidationError::CannotVault.into())
                } else {
                    None
                };
                err.map(|e| (di.clone(), e))
            })
            .collect();
        if !unallowed_derived_dis.is_empty() {
            return Err(DataValidationError::FieldValidationError(unallowed_derived_dis).into());
        }

        // Purposefully overlay derived entries on top of existing entries in order to overwrite
        // an ssn4 that's provided and might not match the given ssn9
        let derived_entries = map.iter().flat_map(|(di, v)| derived_entry(di, v));
        let data: DataIdentifierRequest = map.clone().into_iter().chain(derived_entries).collect();

        // Then, validate that there are no "dangling" extra keys in this request.
        // For example, don't allow updating only AddressLine1 - need the whoel address
        let new_dis = data.keys().cloned().collect_vec();
        let dangling_keys = CollectedDataOption::dangling_identifiers(new_dis);
        if !args.allow_dangling_keys && !dangling_keys.is_empty() {
            let err = Error::from(DataValidationError::ExtraFieldError(dangling_keys));
            return Err(err);
        }

        // Clean and validate each individual piece of data
        let all_data = data.clone();
        let (cleaned_data, errors): (HashMap<_, _>, HashMap<_, _>) =
            data.into_iter()
                .partition_map(|(k, v)| match k.validate(v, args, &all_data) {
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
