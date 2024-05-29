use chrono::{
    DateTime,
    Utc,
};
use paperclip::actix::Apiv2Schema;
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
