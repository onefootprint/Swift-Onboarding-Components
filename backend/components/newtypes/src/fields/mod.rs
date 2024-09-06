mod data_request;
pub mod email;
pub mod input;
pub mod output;
pub mod phone_number;
mod pii;
pub mod ssn;
pub use data_request::*;
pub use pii::*;
pub mod put_data_request;

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
