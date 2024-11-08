use newtypes::impl_map_apiv2_schema;
use newtypes::impl_modern_map_apiv2_schema;
use newtypes::impl_response_type;
use newtypes::BusinessDataIdentifier;
use newtypes::DataIdentifier;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::UserDataIdentifier;
use newtypes::VersionedDataIdentifier;
use std::collections::HashMap;

pub type DecryptResponse = HashMap<VersionedDataIdentifier, Option<PiiJsonValue>>;

macro_rules! impl_collect {
    ($name: ident) => {
        impl<TDi, TPii> FromIterator<(TDi, TPii)> for $name
        where
            TDi: Into<VersionedDataIdentifier>,
            TPii: Into<Option<PiiJsonValue>>,
        {
            fn from_iter<T>(iter: T) -> Self
            where
                T: IntoIterator<Item = (TDi, TPii)>,
            {
                let map: DecryptResponse = iter
                    .into_iter()
                    .map(|(di, pii)| (di.into(), pii.into()))
                    .collect();
                Self(map)
            }
        }
    };
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct UserDecryptResponse(pub DecryptResponse);

// NOTE: we are not serializing that this response can include versioned DIs
impl_map_apiv2_schema!(
    UserDecryptResponse<UserDataIdentifier, Option<PiiJsonValue>>,
    "A key-value map with the corresponding decrypted values",
    { "id.first_name": "Jane", "id.last_name": "Doe" }
);
impl_response_type!(UserDecryptResponse);
impl_collect!(UserDecryptResponse);

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct BusinessDecryptResponse(pub DecryptResponse);

// NOTE: we are not serializing that this response can include versioned DIs
impl_map_apiv2_schema!(
    BusinessDecryptResponse<BusinessDataIdentifier, Option<PiiJsonValue>>,
    "A key-value map with the corresponding decrypted values",
    { "business.name": "Acme Bank", "business.website": "acmebank.org" }
);
impl_response_type!(BusinessDecryptResponse);
impl_collect!(BusinessDecryptResponse);


// TODO: eventually, we should migrate even our public-facing APIs to use this modern response type.
// The modern response type implements Apiv2Schema to generate an actually correct open API schema,
// while the legacy response types use weird `<key>` and `<value>` placeholders.
// But we'll have to update the docs site to use these updated open API specs first.
#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct ModernEntityDecryptResponse(pub DecryptResponse);
// NOTE: we are not serializing that this response can include versioned DIs
impl_modern_map_apiv2_schema!(
    ModernEntityDecryptResponse<DataIdentifier, Option<PiiString>>,
    "",
    { "id.first_name": "Jane", "id.last_name": "Doe" }
);
impl_response_type!(ModernEntityDecryptResponse);
impl_collect!(ModernEntityDecryptResponse);

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct ModernUserDecryptResponse(pub DecryptResponse);
// NOTE: we are not serializing that this response can include versioned DIs
impl_modern_map_apiv2_schema!(
    ModernUserDecryptResponse<UserDataIdentifier, Option<PiiString>>,
    "",
    { "id.first_name": "Jane", "id.last_name": "Doe" }
);
impl_response_type!(ModernUserDecryptResponse);
impl_collect!(ModernUserDecryptResponse);

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct ModernBusinessDecryptResponse(pub DecryptResponse);
// NOTE: we are not serializing that this response can include versioned DIs
impl_modern_map_apiv2_schema!(
    ModernBusinessDecryptResponse<BusinessDataIdentifier, Option<PiiString>>,
    "",
    { "business.name": "Acme Bank", "business.website": "acmebank.org" }
);
impl_response_type!(ModernBusinessDecryptResponse);
impl_collect!(ModernBusinessDecryptResponse);
