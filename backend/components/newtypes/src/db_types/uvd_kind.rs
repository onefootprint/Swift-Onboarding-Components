use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::DataLifetimeKind;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Ord,
    PartialOrd,
    Eq,
    Hash,
    PartialEq,
    Deserialize,
    Serialize,
    Apiv2Schema,
    EnumIter,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
/// Subset of DataAttributes that are stored in the UserVaultData table
pub enum UvdKind {
    FirstName,
    LastName,
    Dob,
    Ssn9,
    Ssn4,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
}

// UvdKind is a subset of DataAttribute, where UvdKind just represents the types of data stored in
// the UserVaultData table
impl From<UvdKind> for DataLifetimeKind {
    fn from(kind: UvdKind) -> Self {
        match kind {
            UvdKind::FirstName => Self::FirstName,
            UvdKind::LastName => Self::LastName,
            UvdKind::Dob => Self::Dob,
            UvdKind::Ssn9 => Self::Ssn9,
            UvdKind::Ssn4 => Self::Ssn4,
            UvdKind::AddressLine1 => Self::AddressLine1,
            UvdKind::AddressLine2 => Self::AddressLine2,
            UvdKind::City => Self::City,
            UvdKind::State => Self::State,
            UvdKind::Zip => Self::Zip,
            UvdKind::Country => Self::Country,
        }
    }
}

crate::util::impl_enum_str_diesel!(UvdKind);
