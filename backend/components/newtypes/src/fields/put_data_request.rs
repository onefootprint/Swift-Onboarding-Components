use crate::impl_map_apiv2_schema;
use crate::impl_modern_map_apiv2_schema;
use crate::impl_request_type;
use crate::BankDataKind;
use crate::BusinessDataIdentifier;
use crate::BusinessDataKind;
use crate::CardDataKind;
use crate::DataIdentifier;
use crate::DataRequest;
use crate::DataValidationError;
use crate::DiValidationError;
use crate::DocumentDiKind;
use crate::NtResult;
use crate::NtValidationError;
use crate::PiiJsonValue;
use crate::PiiString;
use crate::PiiValueKind;
use crate::UserDataIdentifier;
use crate::ValidateArgs;
use either::Either;
use itertools::chain;
use itertools::Itertools;
use std::collections::HashMap;

pub type RawDataRequest = HashMap<DataIdentifier, PiiJsonValue>;

#[derive(
    Debug,
    Clone,
    Default,
    serde::Deserialize,
    derive_more::Deref,
    derive_more::DerefMut,
    derive_more::Into,
    derive_more::IntoIterator,
)]
pub struct RawUserDataRequest(RawDataRequest);
impl_map_apiv2_schema!(
    RawUserDataRequest<UserDataIdentifier, PiiJsonValue>,
    "Key-value map of data to add to the user's vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/vault/fields).",
    { "id.first_name": "Jane", "id.last_name": "Doe", "custom.user_id": "7c50e2bc-c31f-42e3-b2b0-9852010cfd58" }
);
impl_request_type!(RawUserDataRequest);

#[derive(
    Debug, Clone, Default, serde::Deserialize, derive_more::Deref, derive_more::DerefMut, derive_more::Into,
)]
pub struct RawBusinessDataRequest(RawDataRequest);
impl_map_apiv2_schema!(
    RawBusinessDataRequest<BusinessDataIdentifier, PiiJsonValue>,
    "Key-value map of data to add to the business's vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/vault/fields).",
    { "business.name": "Acme Bank", "business.website": "acmebank.org", "custom.account_id": "d0af81fc-41c2-46ca-8a8d-797b8e4d3146" }
);
impl_request_type!(RawBusinessDataRequest);


#[derive(
    Debug, Clone, Default, serde::Deserialize, derive_more::Deref, derive_more::DerefMut, derive_more::Into,
)]
pub struct ModernRawUserDataRequest(RawDataRequest);
impl_modern_map_apiv2_schema!(
    ModernRawUserDataRequest<UserDataIdentifier, PiiString>,
    "Key-value map of data to add to the user's vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/vault/fields).",
    { "id.first_name": "Jane", "id.last_name": "Doe", "custom.user_id": "7c50e2bc-c31f-42e3-b2b0-9852010cfd58" }
);
impl_request_type!(ModernRawUserDataRequest);

#[derive(
    Debug, Clone, Default, serde::Deserialize, derive_more::Deref, derive_more::DerefMut, derive_more::Into,
)]
pub struct ModernRawBusinessDataRequest(RawDataRequest);
impl_modern_map_apiv2_schema!(
    ModernRawBusinessDataRequest<BusinessDataIdentifier, PiiString>,
    "Key-value map of data to add to the business's vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/vault/fields).",
    { "business.name": "Acme Bank", "business.website": "acmebank.org", "custom.account_id": "d0af81fc-41c2-46ca-8a8d-797b8e4d3146" }
);
impl_request_type!(ModernRawBusinessDataRequest);


#[non_exhaustive]
pub struct PatchDataRequest {
    pub updates: DataRequest,
    pub deletions: Vec<DataIdentifier>,
}

impl PatchDataRequest {
    /// Shorthand to parse into a PatchDataRequest
    pub fn clean_and_validate<T: Into<RawDataRequest>>(map: T, opts: ValidateArgs) -> NtResult<Self> {
        let map = map.into();
        // All write paths via API go through this struct, so we can filter out any DIs that we
        // don't want to be written via API here
        let unallowed_dis: HashMap<_, _> = map
            .keys()
            .filter_map(|di| {
                let err = match di {
                    DataIdentifier::Document(k) => match k {
                        DocumentDiKind::OcrData(_, _) => None,  // allow vaulting OCR data
                        DocumentDiKind::Barcodes(_, _) => None, // allow vaulting barcodes
                        _ => Some(DiValidationError::CannotVaultDocument.into()),
                    },
                    DataIdentifier::Card(k) => match k.kind {
                        CardDataKind::ExpMonth
                        | CardDataKind::ExpYear
                        | CardDataKind::Last4
                        | CardDataKind::Fingerprint
                        | CardDataKind::Issuer => Some(DiValidationError::CannotSpecifyDerivedEntry.into()),
                        _ => None,
                    },
                    DataIdentifier::Bank(k) => match k.kind {
                        BankDataKind::Fingerprint => {
                            Some(DiValidationError::CannotSpecifyDerivedEntry.into())
                        }
                        _ => None,
                    },
                    DataIdentifier::Business(k) => match k {
                        BusinessDataKind::BeneficialOwnerData(_, _)
                        | BusinessDataKind::BeneficialOwners
                        | BusinessDataKind::KycedBeneficialOwners => {
                            Some(NtValidationError("Cannot vault beneficial owner data via API").into())
                        }
                        _ => None,
                    },
                    _ => None,
                };
                err.map(|err| (di.clone(), err))
            })
            .collect();
        if !unallowed_dis.is_empty() {
            return Err(DataValidationError::FieldValidationError(unallowed_dis).into());
        }

        let (map, deletions) = map.into_iter().partition_map(|(k, v)| {
            if PiiValueKind::from(&v) == PiiValueKind::Null {
                Either::Right(k)
            } else {
                Either::Left((k, v))
            }
        });
        let valid_request = DataRequest::clean_and_validate(map, opts)?;
        let result = PatchDataRequest {
            updates: valid_request,
            deletions,
        };

        Ok(result)
    }

    pub fn extend(&mut self, other: Self) {
        let Self { updates, deletions } = self;

        updates.extend(other.updates);
        *deletions = chain!(std::mem::take(deletions), other.deletions)
            .unique()
            .collect();
    }
}
