use crate::{
    BusinessDataKind as BDK, DataIdentifier, DataIdentifierKind, DataIdentifierSubtype,
    IdentityDataKind as IDK,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use strum::{EnumIter, IntoEnumIterator};
use strum_macros::{AsRefStr, Display, EnumString};

#[derive(Debug, Eq, PartialEq, Ord, PartialOrd, Hash, Display, Clone, Copy, EnumIter)]
/// Represents a type of collectible data. Each variant represents a set of fields that must be
/// collected together, like FirstName and LastName.
/// Some CollectedData variants have multiple Options of allowable collectible fields. For example,
/// Address can be populated by providing either a PartialAddress or a FullAddress
pub enum CollectedData {
    Name,
    Dob,
    Ssn,
    Address,
    Email,
    PhoneNumber,
    Document,

    // TODO: maybe nest these
    BusinessName,
    BusinessEin,
    BusinessAddress,
    BusinessPhoneNumber,
    BusinessWebsite,
    BusinessBeneficialOwners,
}

impl CollectedData {
    /// Returns all the variants of this CollectedDataOption, in increasing order of "completeness."
    pub fn options(&self) -> Vec<CollectedDataOption> {
        use CollectedDataOption::*;
        match self {
            Self::Name => vec![Name],
            Self::Dob => vec![Dob],
            Self::Email => vec![Email],
            Self::PhoneNumber => vec![PhoneNumber],
            // These are the only two CollectedDatas that map to multiple Options
            // NOTE: these MUST be returned in increasing order of "completeness" - the options that
            // contain fewer fields are first
            Self::Ssn => vec![Ssn4, Ssn9],
            Self::Address => vec![PartialAddress, FullAddress],
            Self::Document => vec![Document, DocumentAndSelfie],
            Self::BusinessName => vec![BusinessName],
            Self::BusinessEin => vec![BusinessEin],
            Self::BusinessAddress => vec![BusinessAddress],
            Self::BusinessPhoneNumber => vec![BusinessPhoneNumber],
            Self::BusinessWebsite => vec![BusinessWebsite],
            Self::BusinessBeneficialOwners => vec![BusinessBeneficialOwners],
        }
    }

    pub fn data_identifier_kind(&self) -> DataIdentifierKind {
        match self {
            Self::BusinessName
            | Self::BusinessEin
            | Self::BusinessAddress
            | Self::BusinessPhoneNumber
            | Self::BusinessWebsite
            | Self::BusinessBeneficialOwners => DataIdentifierKind::Business,
            Self::Name | Self::Dob | Self::Ssn | Self::Address | Self::Email | Self::PhoneNumber => {
                DataIdentifierKind::Id
            }
            Self::Document => DataIdentifierKind::IdDocument,
        }
    }
}

pub trait HasParentCdo {
    fn parent(&self) -> CollectedData;
}

impl HasParentCdo for IDK {
    /// Maps an IDK to the CollectedData variant that contains this IDK
    fn parent(&self) -> CollectedData {
        match self {
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
        }
    }
}

impl HasParentCdo for BDK {
    /// Maps an IDK to the CollectedData variant that contains this IDK
    fn parent(&self) -> CollectedData {
        match self {
            Self::Name => CollectedData::BusinessName,
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
        }
    }
}

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    Display,
    Clone,
    Copy,
    EnumIter,
    Deserialize,
    Serialize,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
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
    PartialAddress,
    Email,
    PhoneNumber,
    Document,
    DocumentAndSelfie,

    // TODO: maybe nest these
    BusinessName,
    BusinessEin,
    BusinessAddress,
    BusinessPhoneNumber,
    BusinessWebsite,
    BusinessBeneficialOwners,
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
            Self::Document => CollectedData::Document,
            Self::DocumentAndSelfie => CollectedData::Document,
            Self::BusinessName => CollectedData::BusinessName,
            Self::BusinessEin => CollectedData::BusinessEin,
            Self::BusinessAddress => CollectedData::BusinessAddress,
            Self::BusinessPhoneNumber => CollectedData::BusinessPhoneNumber,
            Self::BusinessWebsite => CollectedData::BusinessWebsite,
            Self::BusinessBeneficialOwners => CollectedData::BusinessBeneficialOwners,
        }
    }

    /// Maps each CDO to the list of DataIdentifiers to be collected for the option
    fn data_identifiers(&self) -> Option<Vec<DataIdentifier>> {
        // Maybe this could migrate to DataIdentifiers
        match self {
            Self::Name => Some(vec![IDK::FirstName.into(), IDK::LastName.into()]),
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
            Self::PartialAddress => Some(vec![IDK::Zip.into(), IDK::Country.into()]),
            Self::Email => Some(vec![IDK::Email.into()]),
            Self::PhoneNumber => Some(vec![IDK::PhoneNumber.into()]),
            Self::BusinessName => Some(vec![BDK::Name.into()]),
            Self::BusinessEin => Some(vec![BDK::Ein.into()]),
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
            _ => None,
        }
    }

    /// Maps the CDO to the list of Ts represented by the CDO, if self represents T. Otherwise,
    /// returns an empty list.
    pub fn attributes<T>(&self) -> Vec<T>
    where
        T: DataIdentifierSubtype,
    {
        self.data_identifiers()
            .and_then(|dis| {
                dis.into_iter()
                    .map(|di| di.try_into())
                    .collect::<Result<_, _>>()
                    .ok()
            })
            .unwrap_or_default()
    }

    /// Maps the CDO to the list of Ts that are required and are represented by the CDO, if self
    /// represents T. Otherwise, returns an empty list.
    pub fn required_attributes<T>(&self) -> Vec<T>
    where
        T: DataIdentifierSubtype,
    {
        self.attributes::<T>()
            .into_iter()
            .filter(|k| !k.is_optional())
            .collect()
    }

    /// Given a list of IdentityDataKinds (maybe collected via API), computes the set of
    /// CollectedDataOptions represented by this list of IdentityDataKinds
    pub fn list_from<T>(kinds: Vec<T>) -> HashSet<Self>
    where
        T: DataIdentifierSubtype,
    {
        let kinds: HashSet<_> = kinds.into_iter().collect();
        // For each CollectedData variant, figure out which of the options (if any) is represented
        // in the list of kinds
        CollectedData::iter()
            .flat_map(|cd| {
                let possible_options = cd.options();
                // Get the maximal option whose attributes are entirely contained in this list of kinds
                // in the list of kinds
                possible_options
                    .into_iter()
                    .rev()
                    .filter_map(|cdo| {
                        let attributes = cdo.required_attributes::<T>();
                        // Skip CDOs that aren't related to T
                        (!attributes.is_empty()).then_some((cdo, attributes))
                    })
                    .find(|(_, attrs)| {
                        let required_attrs = HashSet::from_iter(attrs.iter().cloned());
                        kinds.is_superset(&required_attrs)
                    })
                    .map(|(cdo, _)| cdo)
            })
            .collect()
    }

    /// Maps the partial variant to a full variant of an option, if exists.
    /// Should stay in sync with CollectedData::options()
    pub fn full_variant(&self) -> Option<Self> {
        match self {
            Self::Ssn4 => Some(Self::Ssn9),
            Self::PartialAddress => Some(Self::FullAddress),
            Self::Document => Some(Self::DocumentAndSelfie),
            _ => None,
        }
    }
}

#[cfg(test)]
mod test {
    use crate::{
        BusinessDataKind as BDK, CollectedData, CollectedDataOption as CDO, DataIdentifierSubtype,
        HasParentCdo, IdentityDataKind as IDK,
    };
    use itertools::Itertools;
    use std::collections::HashSet;
    use strum::IntoEnumIterator;
    use test_case::test_case;

    #[test]
    fn test_collected_data_options() {
        // The Options for each CollectedData must be sorted in order of
        for cd in CollectedData::iter() {
            let options = cd.options();
            assert!(options.len() <= 2, "More than 2 options for CollectedData {}", cd);
            assert!(!options.is_empty(), "No option for CollectedData {}", cd);
            // Enforce that the .full_variant() util stays in sync with .options()
            assert!(options.get(0).unwrap().full_variant() == options.get(1).cloned());

            let attrs_for_options: Vec<_> = options
                .iter()
                .map(|dlk| dlk.required_attributes::<IDK>())
                .collect();
            let is_sorted = attrs_for_options.windows(2).all(|w| w[0].len() <= w[1].len());
            assert!(
                is_sorted,
                "Options for CollectedData {} are not in ascending order",
                cd
            );

            let attrs_for_options: Vec<_> = options
                .iter()
                .map(|dlk| dlk.required_attributes::<BDK>())
                .collect();
            let is_sorted = attrs_for_options.windows(2).all(|w| w[0].len() <= w[1].len());
            assert!(
                is_sorted,
                "Options for CollectedData {} are not in ascending order",
                cd
            );
        }
    }

    #[test]
    fn test_cdo_parent() {
        for cdo in CDO::iter() {
            // Parent's children should contain self
            assert!(cdo.parent().options().contains(&cdo));
        }
    }

    #[test]
    fn test_idk_parent() {
        for idk in IDK::iter() {
            // Parent's children should contain self
            assert!(idk
                .parent()
                .options()
                .into_iter()
                .flat_map(|cdo| cdo.attributes::<IDK>())
                .contains(&idk));
        }
    }

    #[test]
    fn test_bdk_parent() {
        for bdk in BDK::iter() {
            // Parent's children should contain self
            assert!(bdk
                .parent()
                .options()
                .into_iter()
                .flat_map(|cdo| cdo.attributes::<BDK>())
                .contains(&bdk));
        }
    }

    // Identity CDOs
    #[test_case(vec![IDK::FirstName] => HashSet::from_iter([]))]
    #[test_case(vec![IDK::FirstName, IDK::LastName] => HashSet::from_iter([CDO::Name]))]
    #[test_case(vec![IDK::FirstName, IDK::LastName, IDK::Dob, IDK::Email] => HashSet::from_iter([CDO::Name, CDO::Dob, CDO::Email]))]
    #[test_case(vec![IDK::Ssn4, IDK::Dob] => HashSet::from_iter([CDO::Ssn4, CDO::Dob]))]
    #[test_case(vec![IDK::Ssn4, IDK::Ssn9, IDK::Dob] => HashSet::from_iter([CDO::Ssn9, CDO::Dob]))]
    #[test_case(vec![IDK::Ssn9] => HashSet::from_iter([]))]
    #[test_case(vec![IDK::Zip, IDK::Country] => HashSet::from_iter([CDO::PartialAddress]))]
    #[test_case(vec![IDK::AddressLine1, IDK::City, IDK::State, IDK::Zip, IDK::Country] => HashSet::from_iter([CDO::FullAddress]))]
    #[test_case(vec![IDK::AddressLine1, IDK::AddressLine2, IDK::City, IDK::State, IDK::Zip, IDK::Country] => HashSet::from_iter([CDO::FullAddress]))]
    #[test_case(vec![IDK::AddressLine1, IDK::AddressLine2, IDK::City, IDK::State, IDK::Zip, IDK::Country, IDK::FirstName] => HashSet::from_iter([CDO::FullAddress]))]
    #[test_case(vec![IDK::AddressLine1, IDK::AddressLine2, IDK::City, IDK::State, IDK::Zip, IDK::Country, IDK::FirstName, IDK::LastName] => HashSet::from_iter([CDO::FullAddress, CDO::Name]))]
    #[test_case(vec![IDK::Zip, IDK::Ssn4, IDK::LastName, IDK::Country, IDK::FirstName] => HashSet::from_iter([CDO::PartialAddress, CDO::Ssn4, CDO::Name]))]
    #[test_case(vec![IDK::Zip, IDK::Ssn4, IDK::LastName, IDK::Country, IDK::FirstName, IDK::Dob, IDK::Email, IDK::PhoneNumber] => HashSet::from_iter([CDO::PartialAddress, CDO::Ssn4, CDO::Name, CDO::Dob, CDO::Email, CDO::PhoneNumber]))]
    #[test_case(vec![IDK::City, IDK::State, IDK::Zip, IDK::Ssn4, IDK::LastName, IDK::Country, IDK::FirstName, IDK::Dob, IDK::Email, IDK::PhoneNumber] => HashSet::from_iter([CDO::PartialAddress, CDO::Ssn4, CDO::Name, CDO::Dob, CDO::Email, CDO::PhoneNumber]))]
    // Business CDOs
    #[test_case(vec![BDK::Name] => HashSet::from_iter([CDO::BusinessName]))]
    #[test_case(vec![BDK::Ein] => HashSet::from_iter([CDO::BusinessEin]))]
    #[test_case(vec![BDK::AddressLine1] => HashSet::from_iter([]))]
    #[test_case(vec![BDK::AddressLine2] => HashSet::from_iter([]))]
    #[test_case(vec![BDK::AddressLine1, BDK::City, BDK::State, BDK::Zip, BDK::Country] => HashSet::from_iter([CDO::BusinessAddress]))]
    #[test_case(vec![BDK::AddressLine1, BDK::AddressLine2, BDK::City, BDK::State, BDK::Zip, BDK::Country] => HashSet::from_iter([CDO::BusinessAddress]))]
    #[test_case(vec![BDK::PhoneNumber] => HashSet::from_iter([CDO::BusinessPhoneNumber]))]
    #[test_case(vec![BDK::Website] => HashSet::from_iter([CDO::BusinessWebsite]))]
    #[test_case(vec![BDK::BeneficialOwners] => HashSet::from_iter([CDO::BusinessBeneficialOwners]))]
    fn test_parse_list_of_kinds<T>(kinds: Vec<T>) -> HashSet<CDO>
    where
        T: DataIdentifierSubtype,
    {
        CDO::list_from(kinds)
    }
}
