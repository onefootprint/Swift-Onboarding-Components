use super::validation::ObConfigurationArgsToValidate;
use db::models::ob_configuration::NewObConfigurationArgs;
use db::models::ob_configuration::VerificationChecks;
use newtypes::CipKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::CountryRestriction;
use newtypes::CustomDocumentConfig;
use newtypes::DataIdentifier;
use newtypes::DbActor;
use newtypes::DocTypeRestriction;
use newtypes::DocumentCdoInfo;
use newtypes::DocumentRequestConfig;
use newtypes::ObConfigurationKind;
use newtypes::Selfie;
use newtypes::TenantId;
use newtypes::VerificationCheck;
use std::str::FromStr;
use test_case::test_case;

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
    let args = NewObConfigurationArgs {
        name: "Flerp".to_owned(),
        tenant_id: TenantId::test_data("flerp".into()),
        is_live: true,
        author: DbActor::Footprint,
        must_collect_data,
        optional_data,
        can_access_data,
        cip_kind: None,
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        skip_kyb: false,
        doc_scan_for_optional_ssn: None,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        curp_validation_enabled: false,
        verification_checks: VerificationChecks::new_for_test(vec![VerificationCheck::Kyc {}]),
    };
    ObConfigurationArgsToValidate(args).validate_inner().is_ok()
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
    let args = NewObConfigurationArgs {
        name: "Flerp".to_owned(),
        tenant_id: TenantId::test_data("flerp".into()),
        is_live: true,
        author: DbActor::Footprint,
        must_collect_data,
        optional_data,
        can_access_data,
        cip_kind: None,
        is_no_phone_flow: true,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        skip_kyb: false,
        doc_scan_for_optional_ssn: None,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        curp_validation_enabled: false,
        verification_checks: VerificationChecks::new_for_test(vec![VerificationCheck::Kyc {}]),
    };
    ObConfigurationArgsToValidate(args).validate_inner().is_ok()
}

#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![], false => true)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], vec![], true => false)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], vec![], false => false)]
fn test_is_doc_first(
    must_collect_data: Vec<CDO>,
    can_access_data: Vec<CDO>,
    allow_international: bool,
) -> bool {
    let args = NewObConfigurationArgs {
        name: "Flerp".to_owned(),
        tenant_id: TenantId::test_data("flerp".into()),
        is_live: true,
        author: DbActor::Footprint,
        must_collect_data,
        optional_data: vec![],
        can_access_data,
        cip_kind: None,
        is_no_phone_flow: false,
        is_doc_first: true,
        allow_international_residents: allow_international,
        international_country_restrictions: None,
        skip_kyb: false,
        doc_scan_for_optional_ssn: None,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        curp_validation_enabled: false,
        verification_checks: VerificationChecks::new_for_test(vec![VerificationCheck::Kyc {}]),
    };
    ObConfigurationArgsToValidate(args).validate_inner().is_ok()
}

#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], true => true)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber, CDO::Document(DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None))], false => true)]
#[test_case(vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber], false => false)]
fn test_skip_kyc(must_collect_data: Vec<CDO>, allow_international: bool) -> bool {
    let args = NewObConfigurationArgs {
        name: "Flerp".to_owned(),
        tenant_id: TenantId::test_data("flerp".into()),
        is_live: true,
        author: DbActor::Footprint,
        must_collect_data,
        optional_data: vec![],
        can_access_data: vec![],
        cip_kind: None,
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: allow_international,
        international_country_restrictions: None,
        skip_kyb: false,
        doc_scan_for_optional_ssn: None,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        curp_validation_enabled: false,
        verification_checks: VerificationChecks::default(),
    };
    ObConfigurationArgsToValidate(args).validate_inner().is_ok()
}

#[test_case(vec![] => true)]
#[test_case(vec![DocumentRequestConfig::Identity{ collect_selfie: true }] => false)]
#[test_case(vec![DocumentRequestConfig::ProofOfAddress {requires_human_review: true}, DocumentRequestConfig::ProofOfSsn {requires_human_review: true}, DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None, requires_human_review: true}), DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.bye").unwrap(), name: "Bye".to_owned(), description: None, requires_human_review: true})] => true; "proofofssn-proofofaddress-multiple-custom")]
#[test_case(vec![DocumentRequestConfig::ProofOfAddress {requires_human_review: true}, DocumentRequestConfig::ProofOfAddress {requires_human_review: true}] => false)]
#[test_case(vec![DocumentRequestConfig::ProofOfSsn {requires_human_review: true}, DocumentRequestConfig::ProofOfSsn {requires_human_review: true}] => false)]
#[test_case(vec![DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None, requires_human_review: true}), DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None, requires_human_review: true})] => false; "two-custom-with-same-di")]
#[test_case(vec![DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "".to_owned(), description: None, requires_human_review: true})] => false; "custom-with-empty-name")]
#[test_case(vec![DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("custom.hi").unwrap(), name: "Hi".to_owned(), description: None, requires_human_review: true})] => false; "custom-with-non-doc-DI")]
fn test_documents(documents_to_collect: Vec<DocumentRequestConfig>) -> bool {
    let args = NewObConfigurationArgs {
        name: "Flerp".to_owned(),
        tenant_id: TenantId::test_data("flerp".into()),
        is_live: true,
        author: DbActor::Footprint,
        must_collect_data: vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber],
        optional_data: vec![],
        can_access_data: vec![CDO::Name, CDO::FullAddress, CDO::Email, CDO::PhoneNumber],
        cip_kind: None,
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        skip_kyb: false,
        doc_scan_for_optional_ssn: None,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect,
        business_documents_to_collect: vec![],
        curp_validation_enabled: false,
        verification_checks: VerificationChecks::new_for_test(vec![VerificationCheck::Kyc {}]),
    };
    ObConfigurationArgsToValidate(args).validate_inner().is_ok()
}

#[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob] => false)]
#[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Nationality] => true)]
#[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn4, CDO::FullAddress, CDO::Nationality] => false)]
#[test_case(CipKind::Alpaca, vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::Nationality] => false)]
#[test_case(CipKind::Apex, vec![] => true)]
fn test_validate_for_cip(kind: CipKind, must_collect_data: Vec<CDO>) -> bool {
    let args = NewObConfigurationArgs {
        name: "Flerp".to_owned(),
        tenant_id: TenantId::test_data("flerp".into()),
        is_live: true,
        author: DbActor::Footprint,
        must_collect_data,
        optional_data: vec![],
        can_access_data: vec![],
        cip_kind: Some(kind),
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        skip_kyb: false,
        doc_scan_for_optional_ssn: None,
        allow_us_residents: true,
        allow_us_territory_residents: true,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        curp_validation_enabled: false,
        verification_checks: VerificationChecks::new_for_test(vec![
            VerificationCheck::Kyc {},
            VerificationCheck::Aml {
                ofac: true,
                pep: true,
                adverse_media: true,
                continuous_monitoring: true,
                adverse_media_lists: None,
            },
        ]),
    };
    ObConfigurationArgsToValidate(args).validate_for_cip(kind).is_ok()
}
