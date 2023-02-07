pub mod email;
mod identity_data;
pub mod input;
pub mod output;
pub mod phone_number;
mod pii;
pub mod sandbox;
pub use identity_data::*;
pub use pii::*;
pub mod parsing;

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

    pub(crate) use string_api_data_type_alias;
}
