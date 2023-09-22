use std::collections::HashMap;

use crate::{
    flat_api_object_map_type, DataIdentifier, DataRequest, DataValidationError, DocumentKind, NtResult,
    PiiValue, ValidateArgs, ValidationError,
};

flat_api_object_map_type!(
    RawDataRequest<DataIdentifier, PiiValue>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "id.first_name": "Peter", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }"#
);

impl RawDataRequest {
    /// Shorthand to parse into a DataRequest
    pub fn clean_and_validate(self, opts: ValidateArgs) -> NtResult<DataRequest<()>> {
        // All write paths via API go through this struct, so we can filter out any DIs that we
        // don't want to be written via API here
        let unallowed_dis: HashMap<_, _> = self
            .map
            .keys()
            .filter_map(|di| {
                let err = match di {
                    DataIdentifier::Document(k) => match k {
                        DocumentKind::OcrData(_, _) => None, // allow vaulting OCR data
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

        let valid_request = DataRequest::<()>::clean_and_validate(self.map, opts)?;
        Ok(valid_request)
    }
}
