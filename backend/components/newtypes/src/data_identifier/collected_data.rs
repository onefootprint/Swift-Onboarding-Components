use crate::{BusinessDataKind, IdentityDataKind};
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
}

impl IdentityDataKind {
    /// Maps an IdentityDataKind to the CollectedData variant that contains this IDK
    pub fn parent(&self) -> CollectedData {
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

    pub fn identity_attributes(&self) -> Option<Vec<IdentityDataKind>> {
        // Maybe this could migrate to DataIdentifiers
        match self {
            Self::Name => Some(vec![IdentityDataKind::FirstName, IdentityDataKind::LastName]),
            Self::Dob => Some(vec![IdentityDataKind::Dob]),
            Self::Ssn9 => Some(vec![IdentityDataKind::Ssn9, IdentityDataKind::Ssn4]),
            Self::Ssn4 => Some(vec![IdentityDataKind::Ssn4]),
            Self::FullAddress => Some(vec![
                IdentityDataKind::AddressLine1,
                IdentityDataKind::AddressLine2,
                IdentityDataKind::City,
                IdentityDataKind::State,
                IdentityDataKind::Zip,
                IdentityDataKind::Country,
            ]),
            Self::PartialAddress => Some(vec![IdentityDataKind::Zip, IdentityDataKind::Country]),
            Self::Email => Some(vec![IdentityDataKind::Email]),
            Self::PhoneNumber => Some(vec![IdentityDataKind::PhoneNumber]),
            _ => None,
        }
    }

    pub fn required_identity_attributes(&self) -> Option<Vec<IdentityDataKind>> {
        self.identity_attributes()
            .map(|options| options.into_iter().filter(|k| !k.is_optional()).collect())
    }

    pub fn business_attributes(&self) -> Option<Vec<BusinessDataKind>> {
        // Maybe this could migrate to DataIdentifiers
        match self {
            Self::BusinessName => Some(vec![BusinessDataKind::Name]),
            Self::BusinessEin => Some(vec![BusinessDataKind::Ein]),
            Self::BusinessAddress => Some(vec![
                BusinessDataKind::AddressLine1,
                BusinessDataKind::AddressLine2,
                BusinessDataKind::City,
                BusinessDataKind::State,
                BusinessDataKind::Zip,
                BusinessDataKind::Country,
            ]),
            Self::BusinessPhoneNumber => Some(vec![BusinessDataKind::PhoneNumber]),
            Self::BusinessWebsite => Some(vec![BusinessDataKind::Website]),
            _ => None,
        }
    }

    /// Given a list of IdentityDataKinds (maybe collected via API), computes the set of
    /// CollectedDataOptions represented by this list of IdentityDataKinds
    pub fn list_from(kinds: Vec<IdentityDataKind>) -> HashSet<Self> {
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
                    // Skip CDOs that don't have related IDKs, like Document
                    .filter_map(|cdo| cdo.required_identity_attributes().map(|idks| (cdo, idks)))
                    .find(|(_, idks)| {
                        let required_attrs = HashSet::from_iter(idks.iter().cloned());
                        kinds.is_superset(&required_attrs)
                    }).map(|(cdo, _)| cdo)
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
    use itertools::Itertools;
    use std::collections::HashSet;
    use strum::IntoEnumIterator;
    use test_case::test_case;

    use crate::{CollectedData, CollectedDataOption as CDO, IdentityDataKind};
    use IdentityDataKind::*;

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
                .into_iter()
                .map(|dlk| dlk.required_identity_attributes())
                .collect();
            let is_sorted = attrs_for_options.windows(2).all(|w| {
                w[0].as_ref().map(|o| o.len()).unwrap_or_default()
                    <= w[1].as_ref().map(|o| o.len()).unwrap_or_default()
            });
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
        for idk in IdentityDataKind::iter() {
            // Parent's children should contain self
            assert!(idk
                .parent()
                .options()
                .into_iter()
                .flat_map(|cdo| cdo.identity_attributes().unwrap_or_default())
                .contains(&idk));
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
    fn test_parse_list_of_kinds(kinds: Vec<IdentityDataKind>) -> HashSet<CDO> {
        CDO::list_from(kinds)
    }
}
