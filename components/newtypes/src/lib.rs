#[macro_use]
extern crate diesel_derive_newtype;

mod id;
mod phone_number;
pub use self::id::*;
pub use self::phone_number::*;

pub mod db_types;
pub use db_types::*;
