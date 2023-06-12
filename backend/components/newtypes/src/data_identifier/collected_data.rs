use crate::{
    BusinessDataKind as BDK, DataIdentifier, DataIdentifierDiscriminant, DocumentKind as DK,
    IdentityDataKind as IDK, InvestorProfileKind as IPK,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use itertools::Itertools;
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
    Nationality,
    Document,

    // TODO: maybe nest these
    BusinessName,
    BusinessTin,
    BusinessAddress,
    BusinessPhoneNumber,
    BusinessWebsite,
    BusinessBeneficialOwners,
    BusinessCorporationType,

    InvestorProfile,
    Card,
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
            Self::Nationality => vec![Nationality],
            Self::Document => vec![Document, DocumentAndSelfie],
            Self::BusinessName => vec![BusinessName],
            Self::BusinessTin => vec![BusinessTin],
            Self::BusinessAddress => vec![BusinessAddress],
            Self::BusinessPhoneNumber => vec![BusinessPhoneNumber],
            Self::BusinessWebsite => vec![BusinessWebsite],
            Self::BusinessBeneficialOwners => vec![BusinessBeneficialOwners, BusinessKycedBeneficialOwners],
            Self::BusinessCorporationType => vec![BusinessCorporationType],
            Self::InvestorProfile => vec![InvestorProfile],
            Self::Card => vec![Card],
        }
    }

    pub fn data_identifier_kind(&self) -> DataIdentifierDiscriminant {
        match self {
            Self::BusinessName
            | Self::BusinessTin
            | Self::BusinessAddress
            | Self::BusinessPhoneNumber
            | Self::BusinessWebsite
            | Self::BusinessBeneficialOwners
            | Self::BusinessCorporationType => DataIdentifierDiscriminant::Business,
            Self::Name
            | Self::Dob
            | Self::Ssn
            | Self::Address
            | Self::Email
            | Self::PhoneNumber
            | Self::Nationality => DataIdentifierDiscriminant::Id,
            Self::Document => DataIdentifierDiscriminant::Document,
            Self::InvestorProfile => DataIdentifierDiscriminant::InvestorProfile,
            Self::Card => DataIdentifierDiscriminant::Card,
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
    Nationality,

    // these correspond to Identity documents + selfie
    Document,
    DocumentAndSelfie,

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
            Self::Nationality => CollectedData::Nationality,
            Self::Document => CollectedData::Document,
            Self::DocumentAndSelfie => CollectedData::Document,
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
        }
    }

    /// Maps each CDO to the list of DataIdentifiers to be collected for the option
    pub fn data_identifiers(&self) -> Option<Vec<DataIdentifier>> {
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
            Self::Nationality => Some(vec![IDK::Nationality.into()]),
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

            Self::Document => None,
            Self::DocumentAndSelfie => None,

            // TODO we should associate this with types of data
            Self::Card => None,
        }
    }

    /// Maps the CDO to the list of DIs that are required and are represented by the CDO, if self
    /// represents T. Otherwise, returns an empty list.
    pub fn required_data_identifiers(&self) -> Vec<DataIdentifier> {
        self.data_identifiers()
            .map(|dis| dis.into_iter().filter(|k| !k.is_optional()).collect())
            .unwrap_or_default()
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
            Self::PartialAddress => Some(Self::FullAddress),
            Self::Document => Some(Self::DocumentAndSelfie),
            Self::BusinessBeneficialOwners => Some(Self::BusinessKycedBeneficialOwners),
            _ => None,
        }
    }
}

#[cfg(test)]
mod test {
    use crate::{
        BusinessDataKind as BDK, CollectedData, CollectedDataOption as CDO, DataIdentifier as DI,
        DocumentKind as DK, IdentityDataKind as IDK, InvestorProfileKind as IPK,
        IsDataIdentifierDiscriminant, KvDataKey,
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
                .map(|dlk| dlk.required_data_identifiers())
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

    #[test_case(IDK::iter().collect_vec())]
    #[test_case(BDK::iter().collect_vec())]
    #[test_case(IPK::iter().collect_vec())]
    fn test_parent<T>(ids: Vec<T>)
    where
        T: IsDataIdentifierDiscriminant + std::fmt::Debug,
    {
        for id in ids {
            test_discriminant(id.into());
        }
    }

    fn test_discriminant(di: DI) {
        assert!(di
            .parent()
            .unwrap()
            .options()
            .into_iter()
            .flat_map(|cdo| cdo.data_identifiers().unwrap_or_default())
            .contains(&di));
    }

    // Identity CDOs
    #[test_case(vec![IDK::FirstName.into()] => HashSet::from_iter([]))]
    #[test_case(vec![IDK::FirstName.into(), IDK::LastName.into()] => HashSet::from_iter([CDO::Name]))]
    #[test_case(vec![IDK::FirstName.into(), IDK::LastName.into(), IDK::Dob.into(), IDK::Email.into()] => HashSet::from_iter([CDO::Name, CDO::Dob, CDO::Email]))]
    #[test_case(vec![IDK::Ssn4.into(), IDK::Dob.into()] => HashSet::from_iter([CDO::Ssn4, CDO::Dob]))]
    #[test_case(vec![IDK::Ssn4.into(), IDK::Ssn9.into(), IDK::Dob.into()] => HashSet::from_iter([CDO::Ssn9, CDO::Dob]))]
    #[test_case(vec![IDK::Ssn9.into()] => HashSet::from_iter([]))]
    #[test_case(vec![IDK::Zip.into(), IDK::Country.into()] => HashSet::from_iter([CDO::PartialAddress]))]
    #[test_case(vec![IDK::AddressLine1.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into()] => HashSet::from_iter([CDO::FullAddress]))]
    #[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into()] => HashSet::from_iter([CDO::FullAddress]))]
    #[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into(), IDK::FirstName.into()] => HashSet::from_iter([CDO::FullAddress]))]
    #[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into(), IDK::FirstName.into(), IDK::LastName.into()] => HashSet::from_iter([CDO::FullAddress, CDO::Name]))]
    #[test_case(vec![IDK::Zip.into(), IDK::Ssn4.into(), IDK::LastName.into(), IDK::Country.into(), IDK::FirstName.into()] => HashSet::from_iter([CDO::PartialAddress, CDO::Ssn4, CDO::Name]))]
    #[test_case(vec![IDK::Zip.into(), IDK::Ssn4.into(), IDK::LastName.into(), IDK::Country.into(), IDK::FirstName.into(), IDK::Dob.into(), IDK::Email.into(), IDK::PhoneNumber.into()] => HashSet::from_iter([CDO::PartialAddress, CDO::Ssn4, CDO::Name, CDO::Dob, CDO::Email, CDO::PhoneNumber]))]
    #[test_case(vec![IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Ssn4.into(), IDK::LastName.into(), IDK::Country.into(), IDK::FirstName.into(), IDK::Dob.into(), IDK::Email.into(), IDK::PhoneNumber.into()] => HashSet::from_iter([CDO::PartialAddress, CDO::Ssn4, CDO::Name, CDO::Dob, CDO::Email, CDO::PhoneNumber]))]
    // Business CDOs
    #[test_case(vec![BDK::Name.into()] => HashSet::from_iter([CDO::BusinessName]))]
    #[test_case(vec![BDK::Name.into(), BDK::Dba.into()] => HashSet::from_iter([CDO::BusinessName]))]
    #[test_case(vec![BDK::Tin.into()] => HashSet::from_iter([CDO::BusinessTin]))]
    #[test_case(vec![BDK::AddressLine1.into()] => HashSet::from_iter([]))]
    #[test_case(vec![BDK::AddressLine2.into()] => HashSet::from_iter([]))]
    #[test_case(vec![BDK::AddressLine1.into(), BDK::City.into(), BDK::State.into(), BDK::Zip.into(), BDK::Country.into()] => HashSet::from_iter([CDO::BusinessAddress]))]
    #[test_case(vec![BDK::AddressLine1.into(), BDK::AddressLine2.into(), BDK::City.into(), BDK::State.into(), BDK::Zip.into(), BDK::Country.into()] => HashSet::from_iter([CDO::BusinessAddress]))]
    #[test_case(vec![BDK::PhoneNumber.into()] => HashSet::from_iter([CDO::BusinessPhoneNumber]))]
    #[test_case(vec![BDK::Website.into()] => HashSet::from_iter([CDO::BusinessWebsite]))]
    #[test_case(vec![BDK::BeneficialOwners.into()] => HashSet::from_iter([CDO::BusinessBeneficialOwners]))]
    #[test_case(vec![IPK::Occupation.into(), IPK::BrokerageFirmEmployer.into(), IPK::AnnualIncome.into(), IPK::NetWorth.into(), IPK::InvestmentGoals.into(), IPK::RiskTolerance.into(), IPK::Declarations.into()] => HashSet::from_iter([CDO::InvestorProfile]))]
    #[test_case(vec![IPK::Occupation.into(), IPK::BrokerageFirmEmployer.into(), IPK::AnnualIncome.into(), IPK::NetWorth.into(), IPK::InvestmentGoals.into(), IPK::RiskTolerance.into(), IPK::Declarations.into(), DK::FinraComplianceLetter.into()] => HashSet::from_iter([CDO::InvestorProfile]))]
    #[test_case(vec![IPK::AnnualIncome.into(), IPK::NetWorth.into(), IPK::InvestmentGoals.into(), IPK::RiskTolerance.into(), IPK::Declarations.into()] => HashSet::from_iter([CDO::InvestorProfile]))]
    // Mixed
    #[test_case(vec![DI::from(BDK::BeneficialOwners), DI::from(IDK::Ssn4)] => HashSet::from_iter([CDO::BusinessBeneficialOwners, CDO::Ssn4]))]
    #[test_case(vec![DI::from(BDK::BeneficialOwners), DI::from(IDK::Zip), DI::from(IDK::Country)] => HashSet::from_iter([CDO::BusinessBeneficialOwners, CDO::PartialAddress]))]
    fn test_parse_list_of_kinds(kinds: Vec<DI>) -> HashSet<CDO> {
        CDO::list_from(kinds)
    }

    #[test_case(vec![IDK::FirstName.into()], vec![IDK::FirstName.into()])]
    #[test_case(vec![IDK::Ssn4.into(), IDK::PhoneNumber.into(), IDK::Email.into(), KvDataKey::test_data("flerp".to_owned()).into()], vec![])]
    #[test_case(vec![IDK::FirstName.into(), IDK::Ssn4.into()], vec![IDK::FirstName.into()])]
    #[test_case(vec![IDK::LastName.into(), IDK::Ssn4.into()], vec![IDK::LastName.into()])]
    #[test_case(vec![IDK::FirstName.into(), IDK::LastName.into(), IDK::Ssn4.into()], vec![])]
    #[test_case(vec![IDK::AddressLine1.into(), IDK::Zip.into(), IDK::Country.into()], vec![IDK::AddressLine1.into()])]
    #[test_case(vec![IDK::AddressLine2.into(), IDK::Zip.into(), IDK::Country.into()], vec![IDK::AddressLine2.into()])]
    #[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into()], vec![IDK::AddressLine1.into(), IDK::AddressLine2.into()])]
    #[test_case(vec![IDK::AddressLine1.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into()], vec![])]
    #[test_case(vec![IDK::AddressLine1.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into(), IPK::Occupation.into()], vec![IPK::Occupation.into()])]
    #[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::FirstName.into(), IDK::PhoneNumber.into(), IDK::Email.into(), IDK::Dob.into()], vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::FirstName.into()])]
    fn test_dangling_identifiers(dis: Vec<DI>, expected: Vec<DI>) {
        let dangling: HashSet<_> = CDO::dangling_identifiers(dis).into_iter().collect();
        let expected: HashSet<_> = expected.into_iter().collect();
        assert_eq!(dangling, expected);
    }
}
