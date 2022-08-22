pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use super::DataAttribute;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "PascalCase")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum CollectedData {
    Name,
    Dob,
    Ssn,
    Address,
    Email,
    PhoneNumber,
}

crate::util::impl_enum_str_diesel!(CollectedData);

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "PascalCase")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum CollectedDataOption {
    Name,
    Dob,
    Ssn4,
    Ssn9,
    FullAddress,
    PartialAddress,
    Email,
    PhoneNumber,
}

crate::util::impl_enum_str_diesel!(CollectedDataOption);

impl CollectedDataOption {
    pub fn parent(&self) -> CollectedData {
        match self {
            Self::Name => CollectedData::Name,
            Self::Dob => CollectedData::Dob,
            Self::Ssn4 | Self::Ssn9 => CollectedData::Ssn,
            Self::FullAddress | Self::PartialAddress => CollectedData::Address,
            Self::Email => CollectedData::Email,
            Self::PhoneNumber => CollectedData::PhoneNumber,
        }
    }

    pub fn attributes(&self) -> Vec<DataAttribute> {
        match self {
            Self::Name => vec![DataAttribute::FirstName, DataAttribute::LastName],
            Self::Dob => vec![DataAttribute::Dob],
            Self::Ssn9 => vec![DataAttribute::Ssn9, DataAttribute::Ssn4],
            Self::Ssn4 => vec![DataAttribute::Ssn4],
            Self::FullAddress => vec![
                DataAttribute::AddressLine1,
                DataAttribute::AddressLine2,
                DataAttribute::City,
                DataAttribute::State,
                DataAttribute::Zip,
                DataAttribute::Country,
            ],
            Self::PartialAddress => vec![
                DataAttribute::City,
                DataAttribute::State,
                DataAttribute::Zip,
                DataAttribute::Country,
            ],
            Self::Email => vec![DataAttribute::Email],
            Self::PhoneNumber => vec![DataAttribute::PhoneNumber],
        }
    }
}
