use std::collections::HashSet;

pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum::{EnumIter, IntoEnumIterator};
use strum_macros::{AsRefStr, EnumString};

use super::DataLifetimeKind;

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
#[strum(serialize_all = "PascalCase")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
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
}

crate::util::impl_enum_str_diesel!(CollectedData);

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
#[strum(serialize_all = "PascalCase")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
/// Represent the options of allowed CollectedData.
/// Some CollectedData variants only have a single allowable CollectedDataOption.
/// Other CollectedData variants may have multiple Options of assortments of data that can be collected.
/// Each CollectedDataOption maps to a list of DataLifetimeKinds that are represented by the CDO
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

    pub fn attributes(&self) -> Vec<DataLifetimeKind> {
        match self {
            Self::Name => vec![DataLifetimeKind::FirstName, DataLifetimeKind::LastName],
            Self::Dob => vec![DataLifetimeKind::Dob],
            Self::Ssn9 => vec![DataLifetimeKind::Ssn9, DataLifetimeKind::Ssn4],
            Self::Ssn4 => vec![DataLifetimeKind::Ssn4],
            Self::FullAddress => vec![
                DataLifetimeKind::AddressLine1,
                DataLifetimeKind::AddressLine2,
                DataLifetimeKind::City,
                DataLifetimeKind::State,
                DataLifetimeKind::Zip,
                DataLifetimeKind::Country,
            ],
            Self::PartialAddress => vec![DataLifetimeKind::Zip, DataLifetimeKind::Country],
            Self::Email => vec![DataLifetimeKind::Email],
            Self::PhoneNumber => vec![DataLifetimeKind::PhoneNumber],
        }
    }

    pub fn required_attributes(&self) -> Vec<DataLifetimeKind> {
        self.attributes()
            .into_iter()
            .filter(|k| !k.is_optional())
            .collect()
    }

    /// Given a list of DataLifetimeKinds (maybe collected via API), computes the set of
    /// CollectedDataOptions represented by this list of DataLifetimeKinds
    pub fn list_from(kinds: Vec<DataLifetimeKind>) -> HashSet<Self> {
        let kinds: HashSet<_> = kinds.into_iter().collect();
        // For each CollectedData variant, figure out which of the options (if any) is represented
        // in the list of kinds
        CollectedData::iter()
            .flat_map(|cd| {
                let possible_options = cd.options();
                // Get the maximal option whose attributes are entirely contained in this list of kinds
                // in the list of kinds
                possible_options.into_iter().rev().find(|cdo| {
                    let required_attrs = HashSet::from_iter(cdo.required_attributes().into_iter());
                    kinds.is_superset(&required_attrs)
                })
            })
            .collect()
    }

    /// Maps the partial variant to a full variant of an option, if exists.
    /// Should stay in sync with CollectedData::options()
    pub fn full_variant(&self) -> Option<Self> {
        match self {
            Self::Ssn4 => Some(Self::Ssn9),
            Self::PartialAddress => Some(Self::FullAddress),
            _ => None,
        }
    }
}

#[cfg(test)]
mod test {
    use std::collections::HashSet;
    use strum::IntoEnumIterator;
    use test_case::test_case;

    use crate::{CollectedData, CollectedDataOption as CDO, DataLifetimeKind};
    use DataLifetimeKind::*;

    #[test]
    fn test_collected_data_options() {
        // The Options for each CollectedData must be sorted in order of
        for cd in CollectedData::iter() {
            let options = cd.options();
            assert!(options.len() <= 2, "More than 2 options for CollectedData {}", cd);
            assert!(!options.is_empty(), "No option for CollectedData {}", cd);
            // Enforce that the .full_variant() util stays in sync with .options()
            assert!(options.get(0).unwrap().full_variant() == options.get(1).cloned());

            let attrs_for_options: Vec<_> =
                options.into_iter().map(|dlk| dlk.required_attributes()).collect();
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

    #[test_case(vec![FirstName] => HashSet::from_iter([]))]
    #[test_case(vec![FirstName, LastName] => HashSet::from_iter([CDO::Name]))]
    #[test_case(vec![FirstName, LastName, Dob, Email] => HashSet::from_iter([CDO::Name, CDO::Dob, CDO::Email]))]
    #[test_case(vec![Ssn4, Dob] => HashSet::from_iter([CDO::Ssn4, CDO::Dob]))]
    #[test_case(vec![Ssn4, Ssn9, Dob] => HashSet::from_iter([CDO::Ssn9, CDO::Dob]))]
    #[test_case(vec![Ssn9] => HashSet::from_iter([]))]
    #[test_case(vec![Zip, Country] => HashSet::from_iter([CDO::PartialAddress]))]
    #[test_case(vec![AddressLine1, City, State, Zip, Country] => HashSet::from_iter([CDO::FullAddress]))]
    #[test_case(vec![AddressLine1, AddressLine2, City, State, Zip, Country] => HashSet::from_iter([CDO::FullAddress]))]
    #[test_case(vec![AddressLine1, AddressLine2, City, State, Zip, Country, FirstName] => HashSet::from_iter([CDO::FullAddress]))]
    #[test_case(vec![AddressLine1, AddressLine2, City, State, Zip, Country, FirstName, LastName] => HashSet::from_iter([CDO::FullAddress, CDO::Name]))]
    #[test_case(vec![Zip, Ssn4, LastName, Country, FirstName] => HashSet::from_iter([CDO::PartialAddress, CDO::Ssn4, CDO::Name]))]
    #[test_case(vec![Zip, Ssn4, LastName, Country, FirstName, Dob, Email, PhoneNumber] => HashSet::from_iter([CDO::PartialAddress, CDO::Ssn4, CDO::Name, CDO::Dob, CDO::Email, CDO::PhoneNumber]))]
    #[test_case(vec![City, State, Zip, Ssn4, LastName, Country, FirstName, Dob, Email, PhoneNumber] => HashSet::from_iter([CDO::PartialAddress, CDO::Ssn4, CDO::Name, CDO::Dob, CDO::Email, CDO::PhoneNumber]))]
    fn test_parse_list_of_kinds(kinds: Vec<DataLifetimeKind>) -> HashSet<CDO> {
        CDO::list_from(kinds)
    }
}
