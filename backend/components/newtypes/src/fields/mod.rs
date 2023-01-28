pub mod address;
pub mod csv;
pub mod dob;
pub mod email;
mod identity_data;
pub mod name;
pub mod phone_number;
mod pii;
pub mod sandbox;
pub mod ssn;
pub use identity_data::*;
pub use pii::*;

/// helper macro to convert to PiiString
pub mod pii_helper {
    macro_rules! newtype_to_pii {
        ($type: ty) => {
            impl From<$type> for crate::PiiString {
                fn from(t: $type) -> Self {
                    crate::PiiString::from(t.0)
                }
            }
        };
    }

    pub(crate) use newtype_to_pii;
}

pub mod api_schema_helper {
    macro_rules! string_api_data_type_alias {
        ($type: ty) => {
            impl paperclip::v2::schema::TypedData for $type {
                fn data_type() -> paperclip::v2::models::DataType {
                    paperclip::v2::models::DataType::String
                }
            }
        };
    }

    macro_rules! api_data_type_alias {
        ($type: ty, $id: ident) => {
            impl paperclip::v2::schema::TypedData for $type {
                fn data_type() -> paperclip::v2::models::DataType {
                    paperclip::v2::models::DataType::$id
                }
            }
        };
    }

    pub(crate) use api_data_type_alias;
    pub(crate) use string_api_data_type_alias;
}
