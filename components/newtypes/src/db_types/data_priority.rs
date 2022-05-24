pub use derive_more::Display;
use diesel_derive_enum::DbEnum;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

/// The type of data attribute
#[derive(
    Debug,
    DbEnum,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    Hash,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
)]
#[serde(rename_all = "snake_case")]
#[PgType = "data_priority"]
#[DieselType = "Data_priority"]
#[DbValueStyle = "verbatim"]
pub enum DataPriority {
    Primary,
    Secondary,
}
