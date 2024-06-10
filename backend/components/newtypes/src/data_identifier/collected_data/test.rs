use crate::{
    BusinessDataKind as BDK,
    CollectedData as CD,
    CollectedDataOption as CDO,
    DataIdentifier as DI,
    DocumentDiKind as DK,
    IdentityDataKind as IDK,
    InvestorProfileKind as IPK,
    IsDataIdentifierDiscriminant,
    KvDataKey,
};
use itertools::Itertools;
use std::collections::HashSet;
use strum::IntoEnumIterator;
use test_case::test_case;

#[test]
fn test_collected_data_options() {
    // The Options for each CollectedData must be sorted in order of
    for cd in CD::iter() {
        if cd == CD::Document {
            continue;
        }
        let options = cd.options();
        assert!(options.len() <= 2, "More than 2 options for CollectedData {}", cd);
        assert!(!options.is_empty(), "No option for CollectedData {}", cd);
        // Enforce that the .full_variant() util stays in sync with .options()
        assert!(options.first().unwrap().full_variant() == options.get(1).cloned());

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
    for cd in CD::iter() {
        // Parent's children should contain self
        assert!(cd.options().into_iter().all(|cdo| cdo.parent() == cd));
    }
}

#[test_case(IDK::iter().collect_vec())]
#[test_case(BDK::iter().collect_vec())]
#[test_case(IPK::iter().collect_vec())]
fn test_parent<T>(dis: Vec<T>)
where
    T: IsDataIdentifierDiscriminant + std::fmt::Debug,
{
    for di in dis {
        if di.parent().is_none() {
            continue;
        }
        test_discriminant(di.into());
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
#[test_case(vec![IDK::Ssn9.into()] => HashSet::from_iter([CDO::Ssn9]))]
#[test_case(vec![IDK::AddressLine1.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into()] => HashSet::from_iter([CDO::FullAddress]))]
#[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into()] => HashSet::from_iter([CDO::FullAddress]))]
#[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into(), IDK::FirstName.into()] => HashSet::from_iter([CDO::FullAddress]))]
#[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into(), IDK::FirstName.into(), IDK::LastName.into()] => HashSet::from_iter([CDO::FullAddress, CDO::Name]))]
#[test_case(vec![IDK::Zip.into(), IDK::Ssn4.into(), IDK::LastName.into(), IDK::Country.into(), IDK::FirstName.into()] => HashSet::from_iter([CDO::Ssn4, CDO::Name]))]
#[test_case(vec![IDK::Zip.into(), IDK::Ssn4.into(), IDK::LastName.into(), IDK::Country.into(), IDK::FirstName.into(), IDK::Dob.into(), IDK::Email.into(), IDK::PhoneNumber.into()] => HashSet::from_iter([CDO::Ssn4, CDO::Name, CDO::Dob, CDO::Email, CDO::PhoneNumber]))]
#[test_case(vec![IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Ssn4.into(), IDK::LastName.into(), IDK::Country.into(), IDK::FirstName.into(), IDK::Dob.into(), IDK::Email.into(), IDK::PhoneNumber.into()] => HashSet::from_iter([CDO::Ssn4, CDO::Name, CDO::Dob, CDO::Email, CDO::PhoneNumber]))]
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
#[test_case(vec![DI::from(BDK::BeneficialOwners), DI::from(IDK::Zip), DI::from(IDK::Country)] => HashSet::from_iter([CDO::BusinessBeneficialOwners]))]
fn test_parse_list_of_kinds(kinds: Vec<DI>) -> HashSet<CDO> {
    CDO::list_from(kinds)
}

#[test_case(vec![IDK::FirstName.into()], vec![IDK::FirstName.into()])]
#[test_case(vec![IDK::Ssn4.into(), IDK::PhoneNumber.into(), IDK::Email.into(), KvDataKey::test_data("flerp".to_owned()).into()], vec![])]
#[test_case(vec![IDK::FirstName.into(), IDK::Ssn4.into()], vec![IDK::FirstName.into()])]
#[test_case(vec![IDK::LastName.into(), IDK::Ssn4.into()], vec![IDK::LastName.into()])]
#[test_case(vec![IDK::FirstName.into(), IDK::LastName.into(), IDK::Ssn4.into()], vec![])]
#[test_case(vec![IDK::AddressLine1.into(), IDK::FirstName.into(), IDK::LastName.into()], vec![IDK::AddressLine1.into()])]
#[test_case(vec![IDK::AddressLine2.into(), IDK::FirstName.into(), IDK::LastName.into()], vec![IDK::AddressLine2.into()])]
#[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into()], vec![IDK::AddressLine1.into(), IDK::AddressLine2.into()])]
#[test_case(vec![IDK::AddressLine1.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into()], vec![])]
#[test_case(vec![IDK::AddressLine1.into(), IDK::City.into(), IDK::State.into(), IDK::Zip.into(), IDK::Country.into(), IPK::Occupation.into()], vec![IPK::Occupation.into()])]
#[test_case(vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::FirstName.into(), IDK::PhoneNumber.into(), IDK::Email.into(), IDK::Dob.into()], vec![IDK::AddressLine1.into(), IDK::AddressLine2.into(), IDK::City.into(), IDK::State.into(), IDK::FirstName.into()])]
fn test_dangling_identifiers(dis: Vec<DI>, expected: Vec<DI>) {
    let dangling: HashSet<_> = CDO::dangling_identifiers(dis).into_iter().collect();
    let expected: HashSet<_> = expected.into_iter().collect();
    assert_eq!(dangling, expected);
}
