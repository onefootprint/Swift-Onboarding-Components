use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::{CollectedData, DataIdentifier, IsDataIdentifierDiscriminant};

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
}

impl From<BusinessDataKind> for DataIdentifier {
    fn from(value: BusinessDataKind) -> Self {
        Self::Business(value)
    }
}

impl TryFrom<DataIdentifier> for BusinessDataKind {
    type Error = crate::Error;
    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Business(bdk) => Ok(bdk),
            _ => Err(crate::Error::Custom("Can't convert into BDK".to_owned())),
        }
    }
}

impl IsDataIdentifierDiscriminant for BusinessDataKind {
    fn is_optional(&self) -> bool {
        matches!(self, Self::Dba | Self::AddressLine2)
    }

    fn parent(&self) -> Option<CollectedData> {
        let result = match self {
            Self::Name => CollectedData::BusinessName,
            Self::Dba => CollectedData::BusinessName,
            Self::Website => CollectedData::BusinessWebsite,
            Self::PhoneNumber => CollectedData::BusinessPhoneNumber,
            Self::Ein => CollectedData::BusinessEin,
            Self::AddressLine1 => CollectedData::BusinessAddress,
            Self::AddressLine2 => CollectedData::BusinessAddress,
            Self::City => CollectedData::BusinessAddress,
            Self::State => CollectedData::BusinessAddress,
            Self::Zip => CollectedData::BusinessAddress,
            Self::Country => CollectedData::BusinessAddress,
            Self::BeneficialOwners => CollectedData::BusinessBeneficialOwners,
        };
        Some(result)
    }
}

impl BusinessDataKind {
    /// The list of BDKs that are searchable by fingerprint
    pub fn searchable() -> Vec<Self> {
        vec![Self::Name, Self::Dba, Self::Website, Self::PhoneNumber, Self::Ein]
    }
}
