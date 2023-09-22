use std::collections::HashMap;

use newtypes::{flat_api_object_map_type, DataIdentifier, PiiJsonValue, VersionedDataIdentifier};

flat_api_object_map_type!(
    DecryptResponse<VersionedDataIdentifier, Option<PiiJsonValue>>,
    description="A key-value map with the corresponding decrypted values",
    example=r#"{ "id.last_name": "smith", "id.ssn9": "121121212", "custom.credit_card": "1234 1234 1234 1234" }"#
);

impl From<HashMap<DataIdentifier, Option<PiiJsonValue>>> for DecryptResponse {
    fn from(value: HashMap<DataIdentifier, Option<PiiJsonValue>>) -> Self {
        let map: HashMap<_, _> = value
            .into_iter()
            .map(|(di, v)| (VersionedDataIdentifier::new(di), v))
            .collect();
        Self::from(map)
    }
}
