use crate::{
    flat_api_object_map_type, DataIdentifier, DataRequest, NtResult, PiiString, PiiValue, ValidateArgs,
};

flat_api_object_map_type!(
    RawDataRequest<DataIdentifier, PiiValue>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "id.first_name": "Peter", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }"#
);

impl RawDataRequest {
    /// Shorthand to parse into a DataRequest
    pub fn clean_and_validate(self, opts: ValidateArgs) -> NtResult<DataRequest<()>> {
        let map = self
            .map
            .into_iter()
            .map(|(k, v)| -> NtResult<_> {
                let v = match v {
                    PiiValue::String(s) => s,
                    PiiValue::Json(v) => PiiString::try_from(&v)?,
                };
                Ok((k, v))
            })
            .collect::<NtResult<_>>()?;
        let valid_request = DataRequest::<()>::clean_and_validate(map, opts)?;
        Ok(valid_request)
    }
}
