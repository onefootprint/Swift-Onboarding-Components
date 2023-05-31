use crate::{CollectedData, DataIdentifier, IsDataIdentifierDiscriminant};
use strum_macros::{Display, EnumIter, EnumString};

#[derive(Debug, Display, Eq, PartialEq, Hash, Clone, Copy, EnumIter, EnumString)]
#[strum(serialize_all = "snake_case")]
/// Represents the kind of a piece of "identity data" - data which is on your virtual
/// "Footprint ID card" and that we send off to be verified by data vendors.
pub enum IdentityDataKind {
    FirstName,
    LastName,
    Dob,
    Ssn4,
    Ssn9,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
    Email,
    PhoneNumber,
    Nationality,
}

impl From<IdentityDataKind> for DataIdentifier {
    fn from(value: IdentityDataKind) -> Self {
        Self::Id(value)
    }
}

impl TryFrom<DataIdentifier> for IdentityDataKind {
    type Error = crate::Error;
    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Id(idk) => Ok(idk),
            _ => Err(crate::Error::Custom("Can't convert into IDK".to_owned())),
        }
    }
}

impl IsDataIdentifierDiscriminant for IdentityDataKind {
    fn parent(&self) -> Option<CollectedData> {
        let result = match self {
            Self::FirstName => CollectedData::Name,
            Self::LastName => CollectedData::Name,
            Self::Dob => CollectedData::Dob,
            Self::Ssn4 => CollectedData::Ssn,
            Self::Ssn9 => CollectedData::Ssn,
            Self::AddressLine1 => CollectedData::Address,
            Self::AddressLine2 => CollectedData::Address,
            Self::City => CollectedData::Address,
            Self::State => CollectedData::Address,
            Self::Zip => CollectedData::Address,
            Self::Country => CollectedData::Address,
            Self::Email => CollectedData::Email,
            Self::PhoneNumber => CollectedData::PhoneNumber,
            Self::Nationality => CollectedData::Nationality,
        };
        Some(result)
    }

    fn is_optional(&self) -> bool {
        matches!(self, Self::AddressLine2)
    }
}

impl IdentityDataKind {
    /// The list of IDKs that are searchable by fingerprint
    pub fn searchable() -> Vec<Self> {
        vec![
            Self::PhoneNumber,
            Self::Email,
            Self::Ssn9,
            Self::FirstName,
            Self::LastName,
        ]
    }

    // Some kinds we may be more surprised than others seeing show up in multiple distinct vaults
    pub fn should_have_unique_fingerprint(&self) -> bool {
        matches!(self, Self::Ssn9)
    }
}
