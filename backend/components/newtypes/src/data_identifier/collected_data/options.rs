use crate::{
    BusinessDataKind as BDK, CollectedData, DataIdentifier, DocumentCdoInfo, DocumentDiKind as DK,
    IdentityDataKind as IDK, InvestorProfileKind as IPK, Selfie, TenantScope,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use itertools::Itertools;
use paperclip::actix::Apiv2Schema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::collections::HashSet;
use strum::{EnumDiscriminants, IntoEnumIterator};
use strum_macros::{Display, EnumString};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Hash,
    Clone,
    DeserializeFromStr,
    SerializeDisplay,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumDiscriminants,
)]
#[strum_discriminants(name(CollectedDataOptionKind))]
#[strum_discriminants(derive(Display, EnumString))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[diesel(sql_type = Text)]
/// Represent the options of allowed CollectedData.
/// Some CollectedData variants only have a single allowable CollectedDataOption.
/// Other CollectedData variants may have multiple Options of assortments of data that can be collected.
/// Each CollectedDataOption maps to a list of IdentityDataKinds that are represented by the CDO
pub enum CollectedDataOption {
    Name,
    Dob,
    Ssn4,
    Ssn9,
    FullAddress,
    Email,
    PhoneNumber,
    /// Deprecated for new playbooks, but we have a few legacy playbooks using this in prod
    Nationality,
    UsLegalStatus,

    Document(DocumentCdoInfo),

    // TODO: maybe nest these
    BusinessName,
    BusinessTin,
    BusinessAddress,
    BusinessPhoneNumber,
    BusinessWebsite,
    BusinessBeneficialOwners,
    BusinessKycedBeneficialOwners,
    BusinessCorporationType,

    InvestorProfile,

    Card,
}

crate::util::impl_enum_string_diesel!(CollectedDataOption);

impl std::fmt::Display for CollectedDataOption {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        match self {
            CollectedDataOption::Document(doc_info) => write!(f, "{}", doc_info),
            _ => write!(f, "{}", CollectedDataOptionKind::from(self)),
        }
    }
}

#[allow(clippy::use_self)]
impl std::str::FromStr for CollectedDataOption {
    type Err = strum::ParseError;

    fn from_str(s: &str) -> Result<CollectedDataOption, Self::Err> {
        let res = match CollectedDataOptionKind::from_str(s) {
            Err(_) | Ok(CollectedDataOptionKind::Document) => Self::Document(DocumentCdoInfo::from_str(s)?),
            Ok(cdo_kind) => Self::try_from(cdo_kind).map_err(|_| strum::ParseError::VariantNotFound)?,
        };
        Ok(res)
    }
}

// Boiling plate
impl TryFrom<CollectedDataOptionKind> for CollectedDataOption {
    type Error = crate::Error;

    fn try_from(value: CollectedDataOptionKind) -> Result<Self, Self::Error> {
        let v = match value {
            CollectedDataOptionKind::Name => Self::Name,
            CollectedDataOptionKind::Dob => Self::Dob,
            CollectedDataOptionKind::Ssn4 => Self::Ssn4,
            CollectedDataOptionKind::Ssn9 => Self::Ssn9,
            CollectedDataOptionKind::FullAddress => Self::FullAddress,
            CollectedDataOptionKind::Email => Self::Email,
            CollectedDataOptionKind::PhoneNumber => Self::PhoneNumber,
            CollectedDataOptionKind::BusinessName => Self::BusinessName,
            CollectedDataOptionKind::BusinessTin => Self::BusinessTin,
            CollectedDataOptionKind::BusinessAddress => Self::BusinessAddress,
            CollectedDataOptionKind::BusinessPhoneNumber => Self::BusinessPhoneNumber,
            CollectedDataOptionKind::BusinessWebsite => Self::BusinessWebsite,
            CollectedDataOptionKind::BusinessBeneficialOwners => Self::BusinessBeneficialOwners,
            CollectedDataOptionKind::BusinessKycedBeneficialOwners => Self::BusinessKycedBeneficialOwners,
            CollectedDataOptionKind::BusinessCorporationType => Self::BusinessCorporationType,
            CollectedDataOptionKind::InvestorProfile => Self::InvestorProfile,
            CollectedDataOptionKind::Card => Self::Card,
            CollectedDataOptionKind::Nationality => Self::Nationality,
            CollectedDataOptionKind::UsLegalStatus => Self::UsLegalStatus,
            CollectedDataOptionKind::Document => {
                return Err(crate::Error::Custom("Cannot convert".to_owned()))
            }
        };
        Ok(v)
    }
}

impl CollectedDataOption {
    pub fn parent(&self) -> CollectedData {
        match self {
            Self::Name => CollectedData::Name,
            Self::Dob => CollectedData::Dob,
            Self::Ssn4 | Self::Ssn9 => CollectedData::Ssn,
            Self::FullAddress => CollectedData::Address,
            Self::Email => CollectedData::Email,
            Self::PhoneNumber => CollectedData::PhoneNumber,
            Self::Document(_) => CollectedData::Document,
            Self::BusinessName => CollectedData::BusinessName,
            Self::BusinessTin => CollectedData::BusinessTin,
            Self::BusinessAddress => CollectedData::BusinessAddress,
            Self::BusinessPhoneNumber => CollectedData::BusinessPhoneNumber,
            Self::BusinessWebsite => CollectedData::BusinessWebsite,
            Self::BusinessBeneficialOwners => CollectedData::BusinessBeneficialOwners,
            Self::BusinessKycedBeneficialOwners => CollectedData::BusinessBeneficialOwners,
            Self::BusinessCorporationType => CollectedData::BusinessCorporationType,
            Self::InvestorProfile => CollectedData::InvestorProfile,
            Self::Card => CollectedData::Card,
            Self::Nationality => CollectedData::Nationality,
            Self::UsLegalStatus => CollectedData::UsLegalStatus,
        }
    }

    /// Maps each CDO to the list of DataIdentifiers to be collected for the option
    pub fn data_identifiers(&self) -> Option<Vec<DataIdentifier>> {
        match self {
            Self::Name => Some(vec![
                IDK::FirstName.into(),
                IDK::MiddleName.into(),
                IDK::LastName.into(),
            ]),
            Self::Dob => Some(vec![IDK::Dob.into()]),
            Self::Ssn9 => Some(vec![IDK::Ssn9.into(), IDK::Ssn4.into()]),
            Self::Ssn4 => Some(vec![IDK::Ssn4.into()]),
            Self::FullAddress => Some(vec![
                IDK::AddressLine1.into(),
                IDK::AddressLine2.into(),
                IDK::City.into(),
                IDK::State.into(),
                IDK::Zip.into(),
                IDK::Country.into(),
            ]),
            Self::Email => Some(vec![IDK::Email.into()]),
            Self::PhoneNumber => Some(vec![IDK::PhoneNumber.into()]),
            Self::BusinessName => Some(vec![BDK::Name.into(), BDK::Dba.into()]),
            Self::BusinessTin => Some(vec![BDK::Tin.into()]),
            Self::BusinessAddress => Some(vec![
                BDK::AddressLine1.into(),
                BDK::AddressLine2.into(),
                BDK::City.into(),
                BDK::State.into(),
                BDK::Zip.into(),
                BDK::Country.into(),
            ]),
            Self::BusinessPhoneNumber => Some(vec![BDK::PhoneNumber.into()]),
            Self::BusinessWebsite => Some(vec![BDK::Website.into()]),
            Self::BusinessBeneficialOwners => Some(vec![BDK::BeneficialOwners.into()]),
            Self::BusinessKycedBeneficialOwners => Some(vec![BDK::KycedBeneficialOwners.into()]),
            Self::BusinessCorporationType => Some(vec![BDK::CorporationType.into()]),
            // Can we stick the investor profile identifier in here? Even if it's a different DI variant... cool
            Self::InvestorProfile => Some(
                IPK::iter()
                    .map(|x| x.into())
                    .chain(vec![DK::FinraComplianceLetter.into()])
                    .collect(),
            ),

            Self::Document(_) => None,

            // TODO we should associate this with types of data
            Self::Card => None,

            Self::Nationality => Some(vec![IDK::Nationality.into()]),
            Self::UsLegalStatus => Some(vec![
                IDK::UsLegalStatus.into(),
                IDK::Nationality.into(),
                IDK::VisaKind.into(),
                IDK::VisaExpirationDate.into(),
                IDK::Citizenships.into(),
            ]),
        }
    }

    /// Maps the CDO to the list of DIs that are required and are represented by the CDO, if self
    /// represents T. Otherwise, returns an empty list.
    pub fn required_data_identifiers(&self) -> Vec<DataIdentifier> {
        match self {
            Self::Name => vec![IDK::FirstName.into(), IDK::LastName.into()],
            Self::Dob => vec![IDK::Dob.into()],
            Self::Ssn9 => vec![IDK::Ssn9.into()], // No ssn4 here since it's derived
            Self::Ssn4 => vec![IDK::Ssn4.into()],
            // We'll optionally add City, State, and Zip to US addresses
            Self::FullAddress => vec![IDK::AddressLine1.into(), IDK::Country.into()],
            Self::Email => vec![IDK::Email.into()],
            Self::PhoneNumber => vec![IDK::PhoneNumber.into()],
            Self::BusinessName => vec![BDK::Name.into()],
            Self::BusinessTin => vec![BDK::Tin.into()],
            Self::BusinessAddress => vec![
                BDK::AddressLine1.into(),
                BDK::City.into(),
                BDK::State.into(),
                BDK::Zip.into(),
                BDK::Country.into(),
            ],
            Self::BusinessPhoneNumber => vec![BDK::PhoneNumber.into()],
            Self::BusinessWebsite => vec![BDK::Website.into()],
            Self::BusinessBeneficialOwners => vec![BDK::BeneficialOwners.into()],
            Self::BusinessKycedBeneficialOwners => vec![BDK::KycedBeneficialOwners.into()],
            Self::BusinessCorporationType => vec![BDK::CorporationType.into()],
            Self::InvestorProfile => IPK::iter()
                .filter(|x| !x.is_optional())
                .map(|x| x.into())
                .collect(),

            Self::Document(_) => vec![],

            // TODO we should associate this with types of data
            Self::Card => vec![],

            Self::Nationality => vec![IDK::Nationality.into()],
            Self::UsLegalStatus => vec![IDK::UsLegalStatus.into()],
        }
    }

    /// Given a list of DataIdentifiers (maybe collected via API), computes the set of
    /// CollectedDataOptions represented by this list of DataIdentifiers
    pub fn list_from(dis: Vec<DataIdentifier>) -> HashSet<Self> {
        let dis: HashSet<_> = dis.into_iter().collect();
        // For each CollectedData variant, figure out which of the options (if any) is represented
        // in the list of dis
        CollectedData::iter()
            .flat_map(|cd| {
                let possible_options = cd.options();
                // Get the maximal option whose attributes are entirely contained in this list of dis
                // in the list of dis
                possible_options
                    .into_iter()
                    .rev()
                    .filter_map(|cdo| {
                        let dis = cdo.required_data_identifiers();
                        // Filter out CDOs with no required DIs
                        (!dis.is_empty()).then_some((cdo, dis))
                    })
                    .find(|(_, attrs)| {
                        let required_attrs: HashSet<_> = attrs.iter().cloned().collect();
                        dis.is_superset(&required_attrs)
                    })
                    .map(|(cdo, _)| cdo)
            })
            .collect()
    }

    /// Given a list of DataIdentifiers, removes the DIs that are part of a coherent CDO. Returns
    /// extra, "dangling" identifiers that are not part of any CDO.
    /// For example, id.first_name is considered dangling when provided without id.last_name
    pub fn dangling_identifiers(dis: Vec<DataIdentifier>) -> Vec<DataIdentifier> {
        let cdos = CollectedDataOption::list_from(dis.clone());
        let represented_identifiers: HashSet<_> = cdos
            .into_iter()
            .flat_map(|cdo| cdo.data_identifiers().unwrap_or_default())
            .collect();
        // Filter out the DIs that don't have a parent (like custom DIs) - these are never considered
        // dangling
        let keys: HashSet<_> = dis.into_iter().filter(|di| di.parent().is_some()).collect();
        // Keys given minus represented keys
        keys.difference(&represented_identifiers).cloned().collect_vec()
    }

    /// Maps the partial variant to a full variant of an option, if exists.
    /// Should stay in sync with CollectedData::options()
    pub fn full_variant(&self) -> Option<Self> {
        match self {
            Self::Ssn4 => Some(Self::Ssn9),
            Self::BusinessBeneficialOwners => Some(Self::BusinessKycedBeneficialOwners),
            _ => None,
        }
    }

    pub fn permission(self) -> TenantScope {
        match self {
            Self::Document(doc_info) => {
                if doc_info.selfie() == Selfie::RequireSelfie {
                    TenantScope::DecryptDocumentAndSelfie
                } else {
                    TenantScope::DecryptDocument
                }
            }
            data => TenantScope::Decrypt { data },
        }
    }
}
