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
#[PgType = "data_kind"]
#[DieselType = "Data_kind"]
#[DbValueStyle = "verbatim"]
pub enum DataKind {
    FirstName,
    LastName,
    Dob,
    Ssn,
    StreetAddress,
    StreetAddress2,
    City,
    State,
    Zip,
    Country,
    Email,
    PhoneNumber,
}

impl DataKind {
    /// Returns true if a user vault is allowed to have more than one active piece of data for this
    /// kind.
    pub fn allow_multiple(&self) -> bool {
        return matches!(self, DataKind::PhoneNumber | DataKind::Email)
    }
}