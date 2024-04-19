use newtypes::{
    CipKind, CollectedDataOption as CDO, CountryRestriction, CustomDocumentConfig, DataIdentifier,
    DocTypeRestriction, DocumentCdoInfo, DocumentRequestConfig, EnhancedAml, ObConfigurationKind, Selfie,
};
use std::str::FromStr;
use test_case::test_case;

use super::post::{validate_must_collect_for_cip, CreateOnboardingConfigurationRequest};

#[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => true)]
#[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Name, CDO::Ssn4, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))] => false)] // could be true, but client doesn't do this
#[test_case(vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![] => true)]
#[test_case(vec![CDO::Ssn4, CDO::Ssn9], vec![], vec![] => false)]
#[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None)), CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![] => false)]
#[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => true)]
#[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))], vec![], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))] => false)] // could be true, but client doesn't do this
#[test_case(vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![], vec![CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie))] => false)]
#[test_case(vec![CDO::Ssn4], vec![], vec![CDO::Ssn9] => false)]
// optional_data
#[test_case(vec![CDO::Name], vec![CDO::Ssn9], vec![] => true; "allow Ssn9 to be optional")]
#[test_case(vec![CDO::Name], vec![CDO::Ssn4], vec![] => true; "allow Ssn4 to be optional")]
#[test_case(vec![CDO::Email], vec![CDO::Name], vec![] => false; "don't allow non-SSN CDO's to be optional, for now")]
#[test_case(vec![CDO::Name, CDO::Ssn9], vec![CDO::Ssn9], vec![] => false; "can't duplicate across must_collect_data and optional_data")]
#[test_case(vec![CDO::Name, CDO::Ssn9], vec![CDO::Ssn4], vec![] => false; "can't duplicate CDO's with identical parents across must_collect_data and optional_data")]
#[test_case(vec![CDO::Name], vec![CDO::Ssn9], vec![CDO::Name, CDO::Ssn9] => true; "can_access_data can include CDO's in optional_data")]
// same basic validations done on must_collect are done on optional_data
#[test_case(vec![CDO::Name], vec![CDO::Ssn4, CDO::Ssn9], vec![] => false)]
#[test_case(vec![CDO::Name], vec![CDO::Ssn4], vec![CDO::Ssn9] => false)]
fn test(must_collect_data: Vec<CDO>, optional_data: Vec<CDO>, can_access_data: Vec<CDO>) -> bool {
    let req = CreateOnboardingConfigurationRequest {
        name: "Flerp".to_owned(),
        must_collect_data,
        optional_data: Some(optional_data),
        can_access_data,
        cip_kind: None,
        is_no_phone_flow: Some(false),
        is_doc_first_flow: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: Some(EnhancedAml::default()),
        allow_us_residents: Some(true),
        allow_us_territories: Some(false),
        kind: Some(ObConfigurationKind::Kyc),
        skip_confirm: None,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        curp_validation_enabled: None,
    };
    req.validate_inner().is_ok()
}

#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email], vec![], vec![] => true)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], vec![], vec![] => false)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email], vec![CDO::PhoneNumber], vec![] => false)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email], vec![], vec![CDO::PhoneNumber] => false)]
fn test_is_no_phone_flow(
    must_collect_data: Vec<CDO>,
    optional_data: Vec<CDO>,
    can_access_data: Vec<CDO>,
) -> bool {
    let req = CreateOnboardingConfigurationRequest {
        name: "Flerp".to_owned(),
        must_collect_data,
        optional_data: Some(optional_data),
        can_access_data,
        cip_kind: None,
        is_no_phone_flow: Some(true),
        is_doc_first_flow: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: Some(EnhancedAml::default()),
        allow_us_residents: Some(true),
        allow_us_territories: Some(false),
        kind: Some(ObConfigurationKind::Kyc),
        skip_confirm: None,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        curp_validation_enabled: None,
    };
    req.validate(ObConfigurationKind::Kyc).is_ok()
}

#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![], false => true)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![], true => false)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], vec![], false => false)]
fn test_is_doc_first(
    must_collect_data: Vec<CDO>,
    can_access_data: Vec<CDO>,
    allow_international: bool,
) -> bool {
    let req = CreateOnboardingConfigurationRequest {
        name: "Flerp".to_owned(),
        must_collect_data,
        optional_data: None,
        can_access_data,
        cip_kind: None,
        is_no_phone_flow: Some(false),
        is_doc_first_flow: true,
        allow_international_residents: allow_international,
        international_country_restrictions: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: Some(EnhancedAml::default()),
        allow_us_residents: Some(true),
        allow_us_territories: Some(false),
        kind: Some(ObConfigurationKind::Kyc),
        skip_confirm: None,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        curp_validation_enabled: None,
    };
    req.validate(ObConfigurationKind::Kyc).is_ok()
}

#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], true => true)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], false => true)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], false => false)]
fn test_skip_kyc(must_collect_data: Vec<CDO>, allow_international: bool) -> bool {
    let req = CreateOnboardingConfigurationRequest {
        name: "Flerp".to_owned(),
        must_collect_data: must_collect_data.clone(),
        optional_data: None,
        can_access_data: must_collect_data,
        cip_kind: None,
        is_no_phone_flow: Some(false),
        is_doc_first_flow: false,
        allow_international_residents: allow_international,
        international_country_restrictions: None,
        skip_kyc: true,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: Some(EnhancedAml::default()),
        allow_us_residents: Some(true),
        allow_us_territories: Some(false),
        kind: Some(ObConfigurationKind::Kyc),
        skip_confirm: None,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        curp_validation_enabled: None,
    };
    req.validate(ObConfigurationKind::Kyc).is_ok()
}

#[test_case(vec![] => true)]
#[test_case(vec![DocumentRequestConfig::Identity{ collect_selfie: true }] => false)]
#[test_case(vec![DocumentRequestConfig::ProofOfAddress {}, DocumentRequestConfig::ProofOfSsn {}, DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None}), DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.bye").unwrap(), name: "Bye".to_owned(), description: None})] => true; "proofofssn-proofofaddress-multiple-custom")]
#[test_case(vec![DocumentRequestConfig::ProofOfAddress {}, DocumentRequestConfig::ProofOfAddress {}] => false)]
#[test_case(vec![DocumentRequestConfig::ProofOfSsn {}, DocumentRequestConfig::ProofOfSsn {}] => false)]
#[test_case(vec![DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None}), DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None})] => false; "two-custom-with-same-di")]
#[test_case(vec![DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "".to_owned(), description: None})] => false; "custom-with-empty-name")]
#[test_case(vec![DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("custom.hi").unwrap(), name: "Hi".to_owned(), description: None})] => false; "custom-with-non-doc-DI")]
fn test_documents(documents_to_collect: Vec<DocumentRequestConfig>) -> bool {
    let req = CreateOnboardingConfigurationRequest {
        name: "Flerp".to_owned(),
        must_collect_data: vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber],
        optional_data: None,
        can_access_data: vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber],
        cip_kind: None,
        is_no_phone_flow: Some(false),
        is_doc_first_flow: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: Some(EnhancedAml::default()),
        allow_us_residents: Some(true),
        allow_us_territories: Some(false),
        kind: Some(ObConfigurationKind::Kyc),
        skip_confirm: None,
        document_types_and_countries: None,
        documents_to_collect,
        curp_validation_enabled: None,
    };
    req.validate(ObConfigurationKind::Kyc).is_ok()
}

#[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob] => false)]
#[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Nationality] => true)]
#[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn4, CDO::FullAddress, CDO::Nationality] => false)]
#[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::Nationality] => false)]
#[test_case(CipKind::Apex, vec![] => true)]
fn test_validate_for_cip(kind: CipKind, must_collect_data: Vec<CDO>) -> bool {
    validate_must_collect_for_cip(kind, &must_collect_data).is_ok()
}
