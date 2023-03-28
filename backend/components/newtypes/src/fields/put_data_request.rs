use crate::{flat_api_object_map_type, DataIdentifier, DataRequest, NtResult, ParseOptions, PiiString};

flat_api_object_map_type!(
    RawDataRequest<DataIdentifier, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "id.first_name": "Peter", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }"#
);

impl RawDataRequest {
    /// Shorthand to parse into a DataRequest
    pub fn clean_and_validate(self, opts: ParseOptions) -> NtResult<DataRequest<()>> {
        let valid_request = DataRequest::<()>::clean_and_validate(self.into(), opts)?;
        Ok(valid_request)
    }
}
