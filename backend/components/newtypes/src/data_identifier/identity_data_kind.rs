use crate::{
    CollectedData,
    DataIdentifier,
    IsDataIdentifierDiscriminant,
};
use strum_macros::{
    Display,
    EnumIter,
    EnumString,
};

#[derive(Debug, Display, Eq, PartialEq, Hash, Clone, Copy, EnumIter, EnumString)]
#[strum(serialize_all = "snake_case")]
/// Represents the kind of a piece of "identity data" - data which is on your virtual
/// "Footprint ID card" and that we send off to be verified by data vendors.
pub enum IdentityDataKind {
    FirstName,
    MiddleName,
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

    UsLegalStatus,
    VisaKind,
    VisaExpirationDate,
    Nationality,
    Citizenships,

    DriversLicenseNumber,
    DriversLicenseState,
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
        match self {
            Self::FirstName => Some(CollectedData::Name),
            Self::MiddleName => Some(CollectedData::Name),
            Self::LastName => Some(CollectedData::Name),
            Self::Dob => Some(CollectedData::Dob),
            Self::Ssn4 => Some(CollectedData::Ssn),
            Self::Ssn9 => Some(CollectedData::Ssn),
            Self::AddressLine1 => Some(CollectedData::Address),
            Self::AddressLine2 => Some(CollectedData::Address),
            Self::City => Some(CollectedData::Address),
            Self::State => Some(CollectedData::Address),
            Self::Zip => Some(CollectedData::Address),
            Self::Country => Some(CollectedData::Address),
            Self::Email => Some(CollectedData::Email),
            Self::PhoneNumber => Some(CollectedData::PhoneNumber),
            Self::Nationality => Some(CollectedData::UsLegalStatus),
            Self::UsLegalStatus => Some(CollectedData::UsLegalStatus),
            Self::VisaKind => Some(CollectedData::UsLegalStatus),
            Self::VisaExpirationDate => Some(CollectedData::UsLegalStatus),
            Self::Citizenships => Some(CollectedData::UsLegalStatus),
            Self::DriversLicenseNumber => None,
            Self::DriversLicenseState => None,
        }
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
            Self::MiddleName,
            Self::LastName,
            Self::DriversLicenseNumber,
        ]
    }

    // Some kinds we may be more surprised than others seeing show up in multiple distinct vaults
    pub fn should_have_unique_fingerprint(&self) -> bool {
        matches!(self, Self::Ssn9)
    }
}
