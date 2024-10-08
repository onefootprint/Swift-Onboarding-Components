use crate::BoLinkId;
use crate::CollectedData;
use crate::DataIdentifier;
use crate::IsDataIdentifierDiscriminant;
use itertools::Itertools;
use strum::EnumDiscriminants;
use strum::IntoEnumIterator;
use strum_macros::Display;
use strum_macros::EnumIter;
use strum_macros::EnumString;

#[derive(Debug, Clone, PartialEq, Eq, Hash, EnumDiscriminants)]
#[strum_discriminants(name(BusinessDataKindDiscriminant))]
#[strum_discriminants(derive(EnumString, Display, EnumIter))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
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
    /// Note: this variant has a special serialization.
    /// Serializes any data identifier (mostly just identity data) for a given beneficial owner.
    BeneficialOwnerData(BoLinkId, Box<DataIdentifier>),
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
            Self::BeneficialOwnerData(_, _) => CollectedData::BusinessBeneficialOwners,
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
        BusinessDataKindDiscriminant::iter()
            .filter_map(|i| Self::try_from(i).ok())
            .filter(|i| !matches!(i, Self::BeneficialOwners | Self::KycedBeneficialOwners))
            .collect()
    }
}

impl TryFrom<BusinessDataKindDiscriminant> for BusinessDataKind {
    type Error = strum::ParseError;

    fn try_from(value: BusinessDataKindDiscriminant) -> Result<Self, Self::Error> {
        let variant = match value {
            BusinessDataKindDiscriminant::Name => Self::Name,
            BusinessDataKindDiscriminant::Dba => Self::Dba,
            BusinessDataKindDiscriminant::Website => Self::Website,
            BusinessDataKindDiscriminant::PhoneNumber => Self::PhoneNumber,
            BusinessDataKindDiscriminant::Tin => Self::Tin,
            BusinessDataKindDiscriminant::AddressLine1 => Self::AddressLine1,
            BusinessDataKindDiscriminant::AddressLine2 => Self::AddressLine2,
            BusinessDataKindDiscriminant::City => Self::City,
            BusinessDataKindDiscriminant::State => Self::State,
            BusinessDataKindDiscriminant::Zip => Self::Zip,
            BusinessDataKindDiscriminant::Country => Self::Country,
            BusinessDataKindDiscriminant::BeneficialOwners => Self::BeneficialOwners,
            BusinessDataKindDiscriminant::KycedBeneficialOwners => Self::KycedBeneficialOwners,
            BusinessDataKindDiscriminant::CorporationType => Self::CorporationType,
            BusinessDataKindDiscriminant::FormationState => Self::FormationState,
            BusinessDataKindDiscriminant::FormationDate => Self::FormationDate,
            BusinessDataKindDiscriminant::BeneficialOwnerData => {
                return Err(strum::ParseError::VariantNotFound)
            }
        };
        Ok(variant)
    }
}

impl std::str::FromStr for BusinessDataKind {
    type Err = strum::ParseError;

    fn from_str(s: &str) -> Result<Self, <Self as std::str::FromStr>::Err> {
        if s.contains('.') {
            // Only variant like this is BusinessOwnerData
            let mut parts = s.split('.');
            let _ = parts.next();
            let link_id = parts.next().ok_or(strum::ParseError::VariantNotFound)?;
            let di = parts.join(".");
            let link_id = BoLinkId::from_str(link_id).map_err(|_| strum::ParseError::VariantNotFound)?;
            let di = DataIdentifier::from_str(&di).map_err(|_| strum::ParseError::VariantNotFound)?;
            return Ok(Self::BeneficialOwnerData(link_id, Box::new(di)));
        }

        if let Ok(bdk) = BusinessDataKindDiscriminant::from_str(s).and_then(Self::try_from) {
            return Ok(bdk);
        }


        Err(strum::ParseError::VariantNotFound)
    }
}

impl std::fmt::Display for BusinessDataKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        match &self {
            &BusinessDataKind::BeneficialOwnerData(link_id, di) => {
                write!(f, "beneficial_owners.{}.{}", link_id, di)
            }
            _ => write!(f, "{}", BusinessDataKindDiscriminant::from(self)),
        }
    }
}
