use std::collections::HashMap;

use either::Either;
use itertools::Itertools;

use crate::{
    flat_api_object_map_type, DataIdentifier, DataRequest, DataValidationError, DocumentKind, NtResult,
    PiiJsonValue, PiiValueKind, ValidateArgs, ValidationError,
};

flat_api_object_map_type!(
    RawDataRequest<DataIdentifier, PiiJsonValue>,
    description="Key-value map of data to add to the vault",
    example=r#"{ "id.first_name": "Jane", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }"#
);

pub struct PatchDataRequest {
    pub updates: DataRequest<()>,
    pub deletions: Vec<DataIdentifier>,
}

impl RawDataRequest {
    /// Shorthand to parse into a DataRequest
    pub fn clean_and_validate(self, opts: ValidateArgs) -> NtResult<PatchDataRequest> {
        // All write paths via API go through this struct, so we can filter out any DIs that we
        // don't want to be written via API here
        let unallowed_dis: HashMap<_, _> = self
            .map
            .keys()
            .filter_map(|di| {
                let err = match di {
                    DataIdentifier::Document(k) => match k {
                        DocumentKind::OcrData(_, _) => None,  // allow vaulting OCR data
                        DocumentKind::Barcodes(_, _) => None, // allow vaulting barcodes
                        _ => Some(ValidationError::CannotVaultDocument.into()),
                    },
                    _ => None,
                };
                err.map(|err| (di.clone(), err))
            })
            .collect();
        if !unallowed_dis.is_empty() {
            return Err(DataValidationError::FieldValidationError(unallowed_dis).into());
        }

        let (map, deletions) = self.map.into_iter().partition_map(|(k, v)| {
            if PiiValueKind::from(&v) == PiiValueKind::Null {
                Either::Right(k)
            } else {
                Either::Left((k, v))
            }
        });
        let valid_request = DataRequest::<()>::clean_and_validate(map, opts)?;
        let result = PatchDataRequest {
            updates: valid_request,
            deletions,
        };

        Ok(result)
    }
}
