use crate::CollectedData;
use crate::DataIdentifier;
use crate::IsDataIdentifierDiscriminant;
use strum::IntoEnumIterator;
use strum_macros::Display;
use strum_macros::EnumIter;
use strum_macros::EnumString;

#[derive(Debug, Display, Clone, Copy, PartialEq, Eq, Hash, EnumString, EnumIter)]
#[strum(serialize_all = "snake_case")]
/// Represents data that is collected about a particular Business
pub enum BusinessDataKind {
    Name,
    Dba,
    Website,
    PhoneNumber,
    Tin,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
    /// A JSON-serialized list of beneficial owners. Very interestingly, the primary BO exists in
    /// this JSON blob _and_ in the BusinessOwner table in the database.
    BeneficialOwners,
    /// Very similar to BeneficialOwners, but with a few additional fields required to KYC the
    /// secondary BOs. Every record in this JSON blob will also have a corresponding BusinessOwner
    /// row in the database
    KycedBeneficialOwners,
    CorporationType,
    FormationState,
    FormationDate,
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
    fn parent(&self) -> Option<CollectedData> {
        let result = match self {
            Self::Name => CollectedData::BusinessName,
            Self::Dba => CollectedData::BusinessName,
            Self::Website => CollectedData::BusinessWebsite,
            Self::PhoneNumber => CollectedData::BusinessPhoneNumber,
            Self::Tin => CollectedData::BusinessTin,
            Self::AddressLine1 => CollectedData::BusinessAddress,
            Self::AddressLine2 => CollectedData::BusinessAddress,
            Self::City => CollectedData::BusinessAddress,
            Self::State => CollectedData::BusinessAddress,
            Self::Zip => CollectedData::BusinessAddress,
            Self::Country => CollectedData::BusinessAddress,
            Self::BeneficialOwners => CollectedData::BusinessBeneficialOwners,
            Self::KycedBeneficialOwners => CollectedData::BusinessBeneficialOwners,
            Self::CorporationType => CollectedData::BusinessCorporationType,
            Self::FormationDate | Self::FormationState => return None,
        };
        Some(result)
    }
}

impl BusinessDataKind {
    /// The list of BDKs that are searchable by fingerprint
    pub fn searchable() -> Vec<Self> {
        vec![Self::Name, Self::Dba, Self::Website, Self::PhoneNumber, Self::Tin]
    }

    pub fn non_bo_variants() -> Vec<Self> {
        BusinessDataKind::iter()
            .filter(|i| !matches!(i, Self::BeneficialOwners | Self::KycedBeneficialOwners))
            .collect()
    }
}
