#[macro_use]
extern crate diesel_derive_newtype;

mod id;
mod phone_number;
pub use self::id::*;
pub use self::phone_number::*;

pub mod db_types;
pub use db_types::*;

mod b64;
pub use b64::Base64Data;

mod auth_token;
pub use self::auth_token::*;

#[derive(Debug, Clone, thiserror::Error)]
pub enum Error {
    #[error("invalid phone number")]
    InvalidPhoneNumber,
}
