use crate::data_identifier::DiValidationError;
use crate::BankDataKind;
use crate::BankInfo;
use crate::BoLinkId;
use crate::BusinessDataKind;
use crate::CardDataKind;
use crate::CardInfo;
use crate::CleanAndValidate;
use crate::DataIdentifier;
use crate::DataValidationError;
use crate::DeriveValues;
use crate::Error;
use crate::IdentityDataKind as IDK;
use crate::NtResult;
use crate::PiiJsonValue;
use crate::PiiString;
use crate::StorageType;
use either::Either::Left;
use either::Either::Right;
use itertools::chain;
use itertools::Itertools;
use std::clone::Clone;
use std::collections::HashMap;

#[derive(Debug, Clone, derive_more::Deref)]
/// A parsed and validated DataRequest of DataIdentifier -> PiiString
pub struct DataRequest {
    #[deref]
    pub(super) data: HashMap<DataIdentifier, PiiString>,
    pub(super) json_fields: Vec<DataIdentifier>,
}

#[derive(Debug, Copy, Clone)]
pub struct ValidateArgs {
    /// When true, performs some front-loaded validation that vendors normally perform in order to
    /// try to prevent vendors rejecting our request with a 400.
    pub for_bifrost: bool,
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
            is_live,
        }
    }

    pub fn for_non_portable(is_live: bool) -> Self {
        Self {
            ignore_luhn_validation: false,
            for_bifrost: false,
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
            is_live: true,
        }
    }
}

impl DataRequest {
    pub fn clean_and_validate_str(
        map: HashMap<DataIdentifier, PiiString>,
        args: ValidateArgs,
    ) -> NtResult<Self> {
        let map = map.into_iter().map(|(k, v)| (k, PiiJsonValue::from(v))).collect();
        Self::clean_and_validate(map, args)
    }

    /// Parses, cleans, and validates DataIdentifiers into a DataRequest
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

        // Remove any entries that will be overwritten with derived entries.
        // TODO: I don't love that this has to be independently maintained. But these are unique because DIs
        // can be both derived _and_ can be written explicitly
        let derived_dis = map
            .keys()
            .flat_map(|di| match di {
                DataIdentifier::Id(IDK::Ssn9) => vec![IDK::Ssn4.into()],
                DataIdentifier::Id(IDK::VerifiedEmail) => vec![IDK::Email.into()],
                DataIdentifier::Id(IDK::VerifiedPhoneNumber) => vec![IDK::PhoneNumber.into()],
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
        };
        Ok(request)
    }

    pub fn fingerprints(fingerprints: HashMap<DataIdentifier, PiiString>) -> NtResult<Self> {
        for di in fingerprints.keys() {
            let is_fingerprint = matches!(
                di,
                DataIdentifier::Card(CardInfo {
                    alias: _,
                    kind: CardDataKind::Fingerprint
                }) | DataIdentifier::Bank(BankInfo {
                    alias: _,
                    kind: BankDataKind::Fingerprint
                })
            );

            if !is_fingerprint {
                return Err(Error::AssertionError(format!(
                    "Cannot construct fingerprint DataRequest with DI {:?}",
                    di
                )));
            }
        }


        Ok(Self {
            data: fingerprints,
            json_fields: vec![],
        })
    }

    pub fn fixture_data(data: HashMap<DataIdentifier, PiiString>, json_fields: Vec<DataIdentifier>) -> Self {
        Self { data, json_fields }
    }

    pub fn di_is_json(&self, di: &DataIdentifier) -> bool {
        self.json_fields.contains(di)
    }

    /// Filters out the elements that don't match DataIdentifier predicate.
    /// In other words, filters out all items for which f(&di) returns false.
    pub fn filter<F>(self, mut f: F) -> Self
    where
        F: FnMut(&DataIdentifier) -> bool,
    {
        let Self {
            mut data,
            mut json_fields,
        } = self;
        data.retain(|di, _| f(di));
        json_fields.retain(f);
        Self { data, json_fields }
    }

    pub fn extend(&mut self, other: Self) {
        let Self { data, json_fields } = self;

        data.extend(other.data);
        *json_fields = chain!(std::mem::take(json_fields), other.json_fields)
            .unique()
            .collect();
    }

    /// Turn a user DataRequest into a DataRequest that will be stored on the business representing
    /// a beneficial owner that has not yet onboarded.
    pub fn into_beneficial_owner_data(self, link_id: &BoLinkId, ownership_stake: Option<u32>) -> Self {
        let Self { data, json_fields } = self;

        let map_di = move |di| BusinessDataKind::bo_data(link_id.clone(), di).into();

        let mut data: HashMap<_, _> = data.into_iter().map(|(k, v)| (map_di(k), v)).collect();
        let json_fields = json_fields.into_iter().map(map_di).collect();

        if let Some(ownership_stake) = ownership_stake {
            let ownership_stake_di = BusinessDataKind::BeneficialOwnerStake(link_id.clone()).into();
            data.insert(ownership_stake_di, PiiString::from(ownership_stake.to_string()));
        }

        Self { data, json_fields }
    }
}
