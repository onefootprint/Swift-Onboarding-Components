use newtypes::impl_map_apiv2_schema;
use newtypes::impl_response_type;
use newtypes::PiiJsonValue;
use newtypes::VersionedDataIdentifier;
use std::collections::HashMap;

pub type DecryptResponse = HashMap<VersionedDataIdentifier, Option<PiiJsonValue>>;

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct UserDecryptResponse(pub DecryptResponse);

impl_map_apiv2_schema!(
    UserDecryptResponse<VersionedDataIdentifier, Option<PiiJsonValue>>,
    "A key-value map with the corresponding decrypted values",
    { "id.first_name": "Jane", "id.last_name": "Doe" }
);
impl_response_type!(UserDecryptResponse);

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct BusinessDecryptResponse(pub DecryptResponse);

impl_map_apiv2_schema!(
    BusinessDecryptResponse<VersionedDataIdentifier, Option<PiiJsonValue>>,
    "A key-value map with the corresponding decrypted values",
    { "business.name": "Acme Bank", "business.website": "acmebank.org" }
);
impl_response_type!(BusinessDecryptResponse);
