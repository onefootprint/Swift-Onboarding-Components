use chrono::{
    DateTime,
    Utc,
};
use paperclip::actix::{
    Apiv2Response,
    Apiv2Schema,
};
use serde::{
    Deserialize,
    Serialize,
};

mod resources;
pub use resources::*;
pub mod hosted;
mod requests;
pub use self::requests::*;

mod patch;
pub use patch::*;

#[derive(Apiv2Response, Serialize, macros::JsonResponder)]
pub struct Empty;
