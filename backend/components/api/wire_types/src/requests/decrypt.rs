use newtypes::{
    flat_api_object_map_type,
    impl_response_type,
    DataIdentifier,
    PiiJsonValue,
    VersionedDataIdentifier,
};
use std::collections::HashMap;

flat_api_object_map_type!(
    DecryptResponse<VersionedDataIdentifier, Option<PiiJsonValue>>,
    description="A key-value map with the corresponding decrypted values",
    example=r#"{ "id.last_name": "doe", "id.ssn9": "121121212", "custom.credit_card": "4242424242424242" }"#
);
impl_response_type!(DecryptResponse);

impl From<HashMap<DataIdentifier, Option<PiiJsonValue>>> for DecryptResponse {
    fn from(value: HashMap<DataIdentifier, Option<PiiJsonValue>>) -> Self {
        let map: HashMap<_, _> = value
            .into_iter()
            .map(|(di, v)| (VersionedDataIdentifier::new(di), v))
            .collect();
        Self::from(map)
    }
}
