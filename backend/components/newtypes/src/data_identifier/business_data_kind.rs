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
    /// The ownership stake percentage of each linked beneficial owner. This has special
    /// serialization.
    BeneficialOwnerStake(BoLinkId),
    /// Note: this variant has a special serialization.
    /// Serializes any data identifier (mostly just identity data) for a given beneficial owner.
    BeneficialOwnerData(BoLinkId, Box<DataIdentifier>),
    BeneficialOwnerExplanationMessage,
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
            Self::BeneficialOwnerStake(_) => CollectedData::BusinessBeneficialOwners,
            Self::BeneficialOwnerData(_, _) => CollectedData::BusinessBeneficialOwners,
            Self::BeneficialOwnerExplanationMessage => return None,
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

    pub fn api_examples() -> Vec<Self> {
        BusinessDataKindDiscriminant::iter()
            .filter_map(|i| Self::try_from(i).ok())
            .collect()
    }

    pub fn bo_data(link_id: BoLinkId, di: impl Into<DataIdentifier>) -> Self {
        Self::BeneficialOwnerData(link_id, Box::new(di.into()))
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
            BusinessDataKindDiscriminant::BeneficialOwnerStake => {
                return Err(strum::ParseError::VariantNotFound)
            }
            BusinessDataKindDiscriminant::BeneficialOwnerExplanationMessage => {
                Self::BeneficialOwnerExplanationMessage
            }
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
            // Examples:
            //   beneficial_owners.<link_id>.ownership_stake
            //   beneficial_owners.<link_id>.<data_identifier>

            let mut parts = s.split('.');

            let prefix = parts.next();
            if prefix != Some("beneficial_owners") {
                return Err(strum::ParseError::VariantNotFound);
            }

            let link_id = parts.next().ok_or(strum::ParseError::VariantNotFound)?;
            let link_id = BoLinkId::from_str(link_id).map_err(|_| strum::ParseError::VariantNotFound)?;

            let remaining = parts.join(".");
            let di = match remaining.as_str() {
                "ownership_stake" => Self::BeneficialOwnerStake(link_id),
                remaining => {
                    let di = DataIdentifier::from_str(remaining)
                        .map_err(|_| strum::ParseError::VariantNotFound)?;
                    Self::bo_data(link_id, di)
                }
            };
            return Ok(di);
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
            BusinessDataKind::BeneficialOwnerStake(link_id) => {
                write!(f, "beneficial_owners.{}.ownership_stake", link_id)
            }
            BusinessDataKind::BeneficialOwnerData(link_id, di) => {
                write!(f, "beneficial_owners.{}.{}", link_id, di)
            }
            _ => write!(f, "{}", BusinessDataKindDiscriminant::from(self)),
        }
    }
}
