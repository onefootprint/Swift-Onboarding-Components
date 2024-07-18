use crate::impl_map_apiv2_schema;
use crate::impl_request_type;
use crate::CardDataKind;
use crate::DataIdentifier;
use crate::DataRequest;
use crate::DataValidationError;
use crate::DiValidationError;
use crate::DocumentDiKind;
use crate::NtResult;
use crate::PiiJsonValue;
use crate::PiiValueKind;
use crate::ValidateArgs;
use either::Either;
use itertools::Itertools;
use std::collections::HashMap;

#[derive(Debug, Clone, serde::Deserialize, derive_more::Deref, derive_more::DerefMut)]
pub struct RawDataRequest(pub HashMap<DataIdentifier, PiiJsonValue>);

impl_map_apiv2_schema!(
    RawDataRequest<DataIdentifier, PiiJsonValue>,
    "Key-value map of data to add to the vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/vault/fields).",
    { "id.first_name": "Jane", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }
);
impl_request_type!(RawDataRequest);

// TODO separate struct for business data, more realistic examples

pub struct PatchDataRequest {
    pub updates: DataRequest,
    pub deletions: Vec<DataIdentifier>,
}

impl RawDataRequest {
    /// Shorthand to parse into a DataRequest
    pub fn clean_and_validate(self, opts: ValidateArgs) -> NtResult<PatchDataRequest> {
        // All write paths via API go through this struct, so we can filter out any DIs that we
        // don't want to be written via API here
        let unallowed_dis: HashMap<_, _> = self
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
                        | CardDataKind::Issuer => Some(DiValidationError::CannotSpecifyDerivedEntry.into()),
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

        let (map, deletions) = self.0.into_iter().partition_map(|(k, v)| {
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
}
