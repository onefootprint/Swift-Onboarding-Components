use crate::{DataIdentifier, IdentityDataKind};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

#[derive(
    Debug,
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
/// The kind of a `DataLifetime` row. This looks very similar to `DataIdentifier` because nearly
/// every piece of data identified by `DataIdentifier` has a `DataLifetime` row associated with it
pub enum DataLifetimeKind {
    // TODO transparently nest IdentityDataKind here
    FirstName,
    LastName,
    Dob,
    Ssn9,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
    Email,
    PhoneNumber,
    Ssn4,
    IdentityDocument,
    Custom,
}

impl From<IdentityDataKind> for DataLifetimeKind {
    fn from(value: IdentityDataKind) -> Self {
        match value {
            IdentityDataKind::FirstName => Self::FirstName,
            IdentityDataKind::LastName => Self::LastName,
            IdentityDataKind::Dob => Self::Dob,
            IdentityDataKind::Ssn4 => Self::Ssn4,
            IdentityDataKind::Ssn9 => Self::Ssn9,
            IdentityDataKind::AddressLine1 => Self::AddressLine1,
            IdentityDataKind::AddressLine2 => Self::AddressLine2,
            IdentityDataKind::City => Self::City,
            IdentityDataKind::State => Self::State,
            IdentityDataKind::Zip => Self::Zip,
            IdentityDataKind::Country => Self::Country,
            IdentityDataKind::Email => Self::Email,
            IdentityDataKind::PhoneNumber => Self::PhoneNumber,
        }
    }
}

// Used to determine which DLs to load from the DB for a list of DataIdentifiers
impl From<DataIdentifier> for Option<DataLifetimeKind> {
    fn from(value: DataIdentifier) -> Self {
        match value {
            DataIdentifier::Id(id) => Some(id.into()),
            DataIdentifier::Custom(_) => Some(DataLifetimeKind::Custom),
            DataIdentifier::IdDocument => Some(DataLifetimeKind::IdentityDocument),
            DataIdentifier::Selfie => None,
        }
    }
}

crate::util::impl_enum_str_diesel!(DataLifetimeKind);
