use std::collections::HashMap;

use crate::IdentityDataKind as IDK;
use crate::{
    flat_api_object_map_type, BusinessDataKind as BDK, DataIdentifier, DataRequest, Error, KvDataKey,
    NtResult, PiiString,
};

flat_api_object_map_type!(
    PutDataRequest<DataIdentifier, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "id.first_name": "Peter", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }"#
);

pub struct DecomposedPutRequest {
    pub id_update: DataRequest<IDK>,
    // TODO parse with DataRequest
    pub custom_data: HashMap<KvDataKey, PiiString>,
    pub business_data: DataRequest<BDK>,
}

impl PutDataRequest {
    /// Decomposes the hashmap of DataIdentifier -> PiiString into its parts that live in different
    /// underlying database tables.
    pub fn decompose(mut self, for_bifrost: bool) -> NtResult<DecomposedPutRequest> {
        // Custom logic to always populate ssn4 if ssn9 is provided
        if let Some(ssn9) = self.get(&IDK::Ssn9.into()) {
            #[allow(clippy::map_entry)]
            if !self.contains_key(&IDK::Ssn4.into()) {
                let ssn4 = PiiString::new(ssn9.leak().chars().skip(ssn9.leak().len() - 4).collect());
                self.map.insert(IDK::Ssn4.into(), ssn4);
            }
        }

        // Parse identity data
        let (id_update, other_data) = DataRequest::<IDK>::new(self.into(), for_bifrost)?;

        // Parse business data
        let (business_data, other_data) = DataRequest::<BDK>::new(other_data, for_bifrost)?;

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
            business_data,
        };
        Ok(result)
    }
}
