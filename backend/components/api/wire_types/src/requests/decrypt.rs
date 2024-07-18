use newtypes::impl_map_apiv2_schema;
use newtypes::impl_response_type;
use newtypes::DataIdentifier;
use newtypes::PiiJsonValue;
use newtypes::VersionedDataIdentifier;
use std::collections::HashMap;


#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct DecryptResponse(pub HashMap<VersionedDataIdentifier, Option<PiiJsonValue>>);

impl_map_apiv2_schema!(
    DecryptResponse<VersionedDataIdentifier, Option<PiiJsonValue>>,
    "A key-value map with the corresponding decrypted values",
    { "id.first_name": "Jane", "id.last_name": "Doe" }
);
impl_response_type!(DecryptResponse);


impl From<HashMap<DataIdentifier, Option<PiiJsonValue>>> for DecryptResponse {
    fn from(value: HashMap<DataIdentifier, Option<PiiJsonValue>>) -> Self {
        let map: HashMap<_, _> = value
            .into_iter()
            .map(|(di, v)| (VersionedDataIdentifier::new(di), v))
            .collect();
        Self(map)
    }
}
