use std::collections::HashMap;

use newtypes::{flat_api_object_map_type, DataIdentifier, PiiJsonValue, PiiString, VersionedDataIdentifier};

flat_api_object_map_type!(
    DecryptResponse<VersionedDataIdentifier, Option<PiiJsonValue>>,
    description="A key-value map with the corresponding decrypted values",
    example=r#"{ "id.last_name": "smith", "id.ssn9": "121121212", "custom.credit_card": "1234 1234 1234 1234" }"#
);

impl From<HashMap<VersionedDataIdentifier, Option<PiiString>>> for DecryptResponse {
    fn from(value: HashMap<VersionedDataIdentifier, Option<PiiString>>) -> Self {
        let map = value
            .into_iter()
            .map(|(k, v)| {
                // Serialize each value to its correct type based on the DI
                let value = v.map(|v| k.di.serialize(v));
                (k, value)
            })
            .collect();
        Self { map }
    }
}

impl From<HashMap<DataIdentifier, Option<PiiString>>> for DecryptResponse {
    fn from(value: HashMap<DataIdentifier, Option<PiiString>>) -> Self {
        let map: HashMap<_, _> = value
            .into_iter()
            .map(|(di, v)| (VersionedDataIdentifier::new(di), v))
            .collect();
        Self::from(map)
    }
}
