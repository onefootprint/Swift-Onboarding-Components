use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::IsDataIdentifierDiscriminant;

#[derive(
    Debug,
    Display,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Apiv2Schema,
    Serialize,
    Deserialize,
    Hash,
    Clone,
    Copy,
    EnumIter,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
/// Represents data that is collected about a particular Business
pub enum BusinessDataKind {
    Name,
    Dba,
    Website,
    PhoneNumber,
    Ein,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
    BeneficialOwners,
    CorporationType,
}

impl IsDataIdentifierDiscriminant for BusinessDataKind {
    fn is_optional(&self) -> bool {
        matches!(self, Self::Dba | Self::AddressLine2)
    }
}
