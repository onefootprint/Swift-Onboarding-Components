use std::collections::HashMap;

use crate::{
    flat_api_object_map_type, DataIdentifier, Error, IdentityDataUpdate, KvDataKey, NtResult, PiiString,
};

flat_api_object_map_type!(
    PutDataRequest<DataIdentifier, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "id.first_name": "Peter", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }"#
);

pub struct DecomposedPutRequest {
    pub id_update: IdentityDataUpdate,
    pub custom_data: HashMap<KvDataKey, PiiString>,
}

impl PutDataRequest {
    /// Decomposes the hashmap of DataIdentifier -> PiiString into its parts that live in different
    /// underlying database tables.
    pub fn decompose(self, for_bifrost: bool) -> NtResult<DecomposedPutRequest> {
        // Parse identity data
        let (id_update, other_data) = IdentityDataUpdate::new(self.into(), for_bifrost)?;

        // Parse custom data
        let custom_data = other_data
            .into_iter()
            .map(|(k, v)| match k {
                DataIdentifier::Custom(k) => Ok((k, v)),
                k => Err(Error::Custom(format!("Cannot put key {}", k))),
            })
            .collect::<NtResult<HashMap<_, _>>>()?;
        let result = DecomposedPutRequest {
            id_update,
            custom_data,
        };
        Ok(result)
    }
}
