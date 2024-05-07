use crate::models::ob_configuration::ObConfiguration;
use crate::{
    diesel::RunQueryDsl,
    test_helpers::assert_have_same_elements,
    tests::{fixtures, fixtures::ob_configuration::ObConfigurationOpts, prelude::*},
};
use chrono::Utc;
use macros::db_test;
use newtypes::{
    AdverseMediaListKind, ApiKeyStatus, CipKind, CollectedDataOption, CountrySpecificDocumentMapping,
    DocumentAndCountryConfiguration, DocumentCdoInfo, EnhancedAmlOption, DocumentKind,
    Iso3166TwoDigitCountryCode, ObConfigurationId, ObConfigurationKey, ObConfigurationKind, TenantId,
};
use std::{collections::HashMap, str::FromStr};
use strum::IntoEnumIterator;
use test_case::test_case;

#[db_test]
fn test_ob_config(conn: &mut TestPgConn) {
    // Create an ob config
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);

    // Enforce it exists
    let (fetched_ob_config, tenant) =
        ObConfiguration::get_enabled(conn, &ob_config.id).expect("Could not fetch");
    assert_eq!(ob_config.name, fetched_ob_config.name);

    // Mark as inactive
    ObConfiguration::update(
        conn,
        &ob_config.id,
        &tenant.id,
        true,
        None,
        Some(ApiKeyStatus::Disabled),
    )
    .expect("Couldn't update");

    // Enforce it does not exist
    ObConfiguration::get_enabled(conn, &ob_config.id).expect_err("Shouldn't find disabled ob config");
}

#[test_case(true, true, false, None, Iso3166TwoDigitCountryCode::iter().collect(); "allow international, any country acceptable")]
#[test_case(false, false, false, Some(vec![Iso3166TwoDigitCountryCode::MX]), vec![Iso3166TwoDigitCountryCode::MX]; "obc has restrictions")]
#[test_case(true, true, false, Some(vec![Iso3166TwoDigitCountryCode::MX]), vec![Iso3166TwoDigitCountryCode::MX, Iso3166TwoDigitCountryCode::US]; "obc has restrictions and allow us")]
#[test_case(false, true, false,  None, vec![Iso3166TwoDigitCountryCode::US]; "obc doesn't allow international, only US")]
#[test_case(false, true, true,  None, Iso3166TwoDigitCountryCode::all_codes_for_us_including_territories(); "obc is for territories + US")]
#[test_case(true, false, false,  None, Iso3166TwoDigitCountryCode::all_international(); "obc is international without US")]
fn test_ob_config_international_countries(
    allow_international: bool,
    allow_us_residents: bool,
    allow_us_territory_residents: bool,
    international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    expected_countries: Vec<Iso3166TwoDigitCountryCode>,
) {
    let obc = ObConfiguration {
        id: ObConfigurationId::from_str("1234").unwrap(),
        key: ObConfigurationKey::from_str("obk1").unwrap(),
        name: "obc".into(),
        tenant_id: TenantId::from_str("t_1234").unwrap(),
        _created_at: Utc::now(),
        _updated_at: Utc::now(),
        is_live: true,
        status: ApiKeyStatus::Enabled,
        created_at: Utc::now(),
        must_collect_data: vec![],
        can_access_data: vec![],
        appearance_id: None,
        cip_kind: None,
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: allow_international,
        international_country_restrictions,
        author: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: EnhancedAmlOption::No,
        allow_us_residents,
        allow_us_territory_residents,
        kind: ObConfigurationKind::Kyc,
        skip_kyb: false,
        skip_confirm: false,
        document_types_and_countries: None,
        curp_validation_enabled: false,
        documents_to_collect: None,
    };

    assert_have_same_elements(
        obc.supported_countries_for_residential_address(),
        expected_countries,
    )
}

fn obc_with_doc_cdo(
    allow_international: bool,
    international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    doc_cdo: &str,
    tenant_id: Option<&str>,
) -> ObConfiguration {
    ObConfiguration {
        id: ObConfigurationId::from_str("1234").unwrap(),
        key: ObConfigurationKey::from_str("obk1").unwrap(),
        name: "obc".into(),
        tenant_id: TenantId::from_str(tenant_id.unwrap_or("t_1234")).unwrap(),
        _created_at: Utc::now(),
        _updated_at: Utc::now(),
        is_live: true,
        status: ApiKeyStatus::Enabled,
        created_at: Utc::now(),
        must_collect_data: vec![CollectedDataOption::Document(
            DocumentCdoInfo::from_str(doc_cdo).unwrap(),
        )],
        can_access_data: vec![],
        appearance_id: None,
        cip_kind: None,
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: allow_international,
        international_country_restrictions,
        author: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: EnhancedAmlOption::No,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_kyb: false,
        skip_confirm: false,
        document_types_and_countries: None,
        curp_validation_enabled: false,
        documents_to_collect: None,
    }
}

#[test_case(None)]
#[test_case(Some(Iso3166TwoDigitCountryCode::US))]
fn test_supported_country_mapping_us_only(residential_country: Option<Iso3166TwoDigitCountryCode>) {
    // We don't allow international
    //
    // We expect by default to return US with the indicated doc types
    //  every other country with just passport
    let obc = obc_with_doc_cdo(
        false,
        None,
        "document.drivers_license,passport,id_card.none.require_selfie",
        None,
    );

    let mapping = obc.supported_country_mapping_for_document(residential_country);

    // US has the 3 documents indicated
    assert_eq!(
        mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
        vec![DocumentKind::DriversLicense, DocumentKind::Passport, DocumentKind::IdCard]
    );
    // we also allow a passport from any country
    Iso3166TwoDigitCountryCode::iter()
        .filter(|c| !c.is_us_including_territories())
        .for_each(|c| assert_eq!(mapping.get(&c).cloned().unwrap(), vec![DocumentKind::Passport]))
}

#[test]
fn test_supported_country_mapping_override_for_coba() {
    let obc = obc_with_doc_cdo(
        false,
        None,
        "document.drivers_license,passport,voter_identification.none.require_selfie",
        Some("org_5lwSs95mU5v3gOU9xdSaml"),
    );

    Iso3166TwoDigitCountryCode::iter()
        .filter(|c| *c != Iso3166TwoDigitCountryCode::MX)
        .for_each(|c| {
            let supported = obc.supported_country_mapping_for_document(Some(c));
            assert_eq!(supported.get(&c).cloned().unwrap(), vec![DocumentKind::Passport])
        });

    let supported = obc.supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::MX));
    assert_have_same_elements(
        supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
        vec![
            DocumentKind::Passport,
            DocumentKind::DriversLicense,
            DocumentKind::VoterIdentification,
        ],
    );
    // Second form of ID: Mexican Resident Card
    let obc = obc_with_doc_cdo(
        false,
        None,
        "document.residence_document.none.require_selfie",
        Some("org_5lwSs95mU5v3gOU9xdSaml"),
    );

    let all_supported = obc.supported_country_mapping_for_document(None);
    assert_eq!(all_supported.keys().len(), 1);
    assert_have_same_elements(
        all_supported
            .get(&Iso3166TwoDigitCountryCode::MX)
            .cloned()
            .unwrap(),
        vec![DocumentKind::ResidenceDocument],
    );

    let supported = obc.supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::MX));
    assert_have_same_elements(
        supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
        vec![DocumentKind::ResidenceDocument],
    );

    // Second form of ID: Any additional document (voters ID, drivers license, etc)
    let obc = obc_with_doc_cdo(
        false,
        None,
        "document.drivers_license,voter_identification,visa,id_card,residence_document.none.require_selfie",
        Some("org_5lwSs95mU5v3gOU9xdSaml"),
    );

    let all_supported = obc.supported_country_mapping_for_document(None);
    assert_eq!(all_supported.keys().len(), 1);
    assert_have_same_elements(
        all_supported
            .get(&Iso3166TwoDigitCountryCode::MX)
            .cloned()
            .unwrap(),
        vec![
            DocumentKind::ResidenceDocument,
            DocumentKind::DriversLicense,
            DocumentKind::Visa,
            DocumentKind::VoterIdentification,
            DocumentKind::IdCard,
        ],
    );

    let supported = obc.supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::MX));
    assert_have_same_elements(
        supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
        vec![
            DocumentKind::ResidenceDocument,
            DocumentKind::DriversLicense,
            DocumentKind::Visa,
            DocumentKind::VoterIdentification,
            DocumentKind::IdCard,
        ],
    );

    // Second form of ID: Driver's license
    let obc = obc_with_doc_cdo(
        false,
        None,
        "document.drivers_license.none.require_selfie",
        Some("org_5lwSs95mU5v3gOU9xdSaml"),
    );

    let all_supported = obc.supported_country_mapping_for_document(None);
    assert_eq!(all_supported.keys().len(), 1);
    assert_have_same_elements(
        all_supported
            .get(&Iso3166TwoDigitCountryCode::MX)
            .cloned()
            .unwrap(),
        vec![DocumentKind::DriversLicense],
    );

    let supported = obc.supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::MX));
    assert_have_same_elements(
        supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
        vec![DocumentKind::DriversLicense],
    )
}

#[test_case(None, None)]
#[test_case(Some(Iso3166TwoDigitCountryCode::US), None)]
#[test_case(Some(Iso3166TwoDigitCountryCode::MX), None)]
#[test_case(Some(Iso3166TwoDigitCountryCode::NO), None)]
#[test_case(None, Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
#[test_case(Some(Iso3166TwoDigitCountryCode::US), Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
#[test_case(Some(Iso3166TwoDigitCountryCode::MX), Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
#[test_case(Some(Iso3166TwoDigitCountryCode::NO), Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
fn test_supported_country_mapping_allow_international(
    residential_country: Option<Iso3166TwoDigitCountryCode>,
    international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
) {
    // In this test we allow international, and therefore need to handle residential addresses that are non-US.
    // - in the case we get an international residential address, we only accept passport.
    // - in the case we get a US residential address, we allow DL + passport
    //
    // Note: international country restrictions do not affect the countries you can submit a passport for, this just controls
    // residential address - there are integration tests testing this part
    let obc = obc_with_doc_cdo(
        true,
        international_country_restrictions,
        "document.drivers_license,passport.none.require_selfie",
        None,
    );

    let mapping = obc.supported_country_mapping_for_document(residential_country);

    match residential_country.map(|c| c.is_us_including_territories()) {
        // country provided
        Some(is_us) => {
            // residential country is the us, we get DL + ppt
            if is_us {
                assert_eq!(
                    mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
                    vec![DocumentKind::DriversLicense, DocumentKind::Passport]
                );
            } else {
                // country is !US, we only can submit US passports
                assert_eq!(
                    mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
                    vec![DocumentKind::Passport]
                );
            }
        }
        // default case where no country yet, US supports all doc types it can
        None => {
            assert_eq!(
                mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
                vec![DocumentKind::DriversLicense, DocumentKind::Passport]
            );
        }
    }

    // in all cases, non-US can just upload passport
    Iso3166TwoDigitCountryCode::iter()
        .filter(|c| !c.is_us_including_territories())
        .for_each(|c| assert_eq!(mapping.get(&c).cloned().unwrap(), vec![DocumentKind::Passport]))
}

#[test_case(Some("document.passport.none.none") => Some(vec![DocumentKind::Passport]))]
#[test_case(Some("document.passport,drivers_license.none.none") => Some(vec![DocumentKind::Passport, DocumentKind::DriversLicense]))]
#[test_case(None => None)]
#[test_case(Some("full_address") => None)] // obc will fail when getting created anyways
fn test_doc_scan_for_optional_ssn(cdo: Option<&str>) -> Option<Vec<DocumentKind>> {
    let obc = ObConfiguration {
        id: ObConfigurationId::from_str("1234").unwrap(),
        key: ObConfigurationKey::from_str("obk1").unwrap(),
        name: "obc".into(),
        tenant_id: TenantId::from_str("t_1234").unwrap(),
        _created_at: Utc::now(),
        _updated_at: Utc::now(),
        is_live: true,
        status: ApiKeyStatus::Enabled,
        created_at: Utc::now(),
        must_collect_data: vec![],
        can_access_data: vec![],
        appearance_id: None,
        cip_kind: None,
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        author: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: cdo.map(|c| (CollectedDataOption::from_str(c).unwrap())),
        enhanced_aml: EnhancedAmlOption::No,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_kyb: false,
        skip_confirm: false,
        document_types_and_countries: None,
        curp_validation_enabled: false,
        documents_to_collect: None,
    };

    obc.optional_ssn_restricted_id_doc_kinds()
}

#[test_case(None, None)]
#[test_case(None, Some(Iso3166TwoDigitCountryCode::US))]
#[test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::US))]
#[test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::PR))]
#[test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::GU))]
#[test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::CA))]
fn test_cip_kind_documents(cip: Option<CipKind>, residential_country: Option<Iso3166TwoDigitCountryCode>) {
    let obc = ObConfiguration {
        id: ObConfigurationId::from_str("1234").unwrap(),
        key: ObConfigurationKey::from_str("obk1").unwrap(),
        name: "obc".into(),
        tenant_id: TenantId::from_str("t_1234").unwrap(),
        _created_at: Utc::now(),
        _updated_at: Utc::now(),
        is_live: true,
        status: ApiKeyStatus::Enabled,
        created_at: Utc::now(),
        must_collect_data: vec![],
        can_access_data: vec![],
        appearance_id: None,
        // Testing this!!!
        cip_kind: cip,
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        author: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: EnhancedAmlOption::No,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_kyb: false,
        skip_confirm: false,
        document_types_and_countries: None,
        curp_validation_enabled: false,
        documents_to_collect: None,
    };

    let mapping = obc.supported_country_mapping_for_document(residential_country).0;
    if let Some(c) = cip {
        match c {
            CipKind::Alpaca => match residential_country {
                Some(country) if country.is_us_territory() => {
                    assert!(mapping.keys().len() == 2);
                    assert_eq!(
                        mapping.get(&Iso3166TwoDigitCountryCode::US).unwrap().clone(),
                        vec![DocumentKind::DriversLicense, DocumentKind::IdCard,]
                    );
                    assert_eq!(
                        mapping.get(&country).unwrap().clone(),
                        vec![DocumentKind::DriversLicense, DocumentKind::IdCard,]
                    );
                }
                Some(_) => {
                    assert!(mapping.keys().len() == 1);
                    assert_eq!(
                        mapping.get(&Iso3166TwoDigitCountryCode::US).unwrap().clone(),
                        vec![DocumentKind::DriversLicense, DocumentKind::IdCard,]
                    );
                }
                None => {
                    assert!(mapping.keys().len() == 1);
                    assert_eq!(
                        mapping.get(&Iso3166TwoDigitCountryCode::US).unwrap().clone(),
                        vec![DocumentKind::DriversLicense, DocumentKind::IdCard,]
                    );
                }
            },
            CipKind::Apex => unimplemented!(),
        }
    } else {
        assert!(mapping.keys().len() > 1);
    }
}

#[test]
fn test_document_types_and_countries() {
    let supported = CountrySpecificDocumentMapping(HashMap::from_iter(vec![(
        Iso3166TwoDigitCountryCode::CA,
        vec![DocumentKind::DriversLicense],
    )]));
    let doc_config = DocumentAndCountryConfiguration {
        global: vec![],
        country_specific: supported,
    };
    let obc_with_supported_countries_set = ObConfiguration {
        id: ObConfigurationId::from_str("1234").unwrap(),
        key: ObConfigurationKey::from_str("obk1").unwrap(),
        name: "obc".into(),
        tenant_id: TenantId::from_str("t_1234").unwrap(),
        _created_at: Utc::now(),
        _updated_at: Utc::now(),
        is_live: true,
        status: ApiKeyStatus::Enabled,
        created_at: Utc::now(),
        must_collect_data: vec![],
        can_access_data: vec![],
        appearance_id: None,
        cip_kind: None,
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        author: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: EnhancedAmlOption::No,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_kyb: false,
        skip_confirm: false,
        // TESTING THIS
        document_types_and_countries: Some(doc_config),
        curp_validation_enabled: false,
        documents_to_collect: None,
    };

    let mapping = obc_with_supported_countries_set
        .supported_country_mapping_for_document(None)
        .0;
    assert_eq!(mapping.keys().len(), 1);
    assert_eq!(
        mapping.get(&Iso3166TwoDigitCountryCode::CA).unwrap().clone(),
        vec![DocumentKind::DriversLicense]
    );
}

#[test]
fn test_document_and_countries_field_with_cip_kind() {
    let supported = CountrySpecificDocumentMapping(HashMap::from_iter(vec![(
        Iso3166TwoDigitCountryCode::PR,
        vec![DocumentKind::Visa],
    )]));
    let doc_config = DocumentAndCountryConfiguration {
        global: vec![],
        country_specific: supported,
    };
    let obc_with_supported_countries_and_cip_kind = ObConfiguration {
        id: ObConfigurationId::from_str("1234").unwrap(),
        key: ObConfigurationKey::from_str("obk1").unwrap(),
        name: "obc".into(),
        tenant_id: TenantId::from_str("t_1234").unwrap(),
        _created_at: Utc::now(),
        _updated_at: Utc::now(),
        is_live: true,
        status: ApiKeyStatus::Enabled,
        created_at: Utc::now(),
        must_collect_data: vec![],
        can_access_data: vec![],
        appearance_id: None,
        // TESTING THIS
        cip_kind: Some(CipKind::Alpaca),
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        author: None,
        skip_kyc: false,
        doc_scan_for_optional_ssn: None,
        enhanced_aml: EnhancedAmlOption::No,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_kyb: false,
        skip_confirm: false,
        // TESTING THIS
        document_types_and_countries: Some(doc_config),
        curp_validation_enabled: false,
        documents_to_collect: None,
    };

    // Despite configuring document_types_and_countries on the OBC, we respect the alpaca overrides
    let mapping = obc_with_supported_countries_and_cip_kind
        .supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::PR))
        .0;
    assert_eq!(mapping.keys().len(), 2);
    // we respect alpaca overrides
    assert_eq!(
        mapping.get(&Iso3166TwoDigitCountryCode::PR).unwrap().clone(),
        vec![DocumentKind::DriversLicense, DocumentKind::IdCard]
    );
}

#[db_test]
pub fn test_enhanced_aml_addition_of_am_lists_is_backwards_compatible(conn: &mut TestPgConn) {
    let t = fixtures::tenant::create(conn);
    let obc = fixtures::ob_configuration::create(conn, &t.id, true);
    assert_eq!(obc.enhanced_aml, EnhancedAmlOption::No);
    diesel::sql_query(format!(
            "update ob_configuration set enhanced_aml={} where id = '{}';",
            r#"'{"data": {"pep": false, "ofac": true, "adverse_media": true, "continuous_monitoring": true}, "kind": "yes"}'"#, obc.id
        ))
        .execute(conn.conn())
        .unwrap();
    let (obc, _) = ObConfiguration::get(conn, &obc.id).unwrap();
    assert_eq!(
        EnhancedAmlOption::Yes {
            ofac: true,
            pep: false,
            adverse_media: true,
            continuous_monitoring: true,
            adverse_media_lists: None
        },
        obc.enhanced_aml
    );

    let enhanced_aml = EnhancedAmlOption::Yes {
        ofac: true,
        pep: false,
        adverse_media: true,
        continuous_monitoring: true,
        adverse_media_lists: Some(vec![
            AdverseMediaListKind::FinancialCrime,
            AdverseMediaListKind::Fraud,
        ]),
    };
    let obc = fixtures::ob_configuration::create_with_opts(
        conn,
        &t.id,
        ObConfigurationOpts {
            enhanced_aml: enhanced_aml.clone(),
            ..Default::default()
        },
    );
    assert_eq!(enhanced_aml, obc.enhanced_aml);

    // since im gunna manually set this in PG for Composer, nice to explicitly test here too
    diesel::sql_query(format!(
            "update ob_configuration set enhanced_aml={} where id = '{}';",
            r#"'{"data": {"pep": false, "ofac": true, "adverse_media": true, "continuous_monitoring": true, "adverse_media_lists": ["financial_crime", "fraud"]}, "kind": "yes"}'"#, obc.id
        ))
        .execute(conn.conn())
        .unwrap();
    let (obc, _) = ObConfiguration::get(conn, &obc.id).unwrap();
    assert_eq!(
        EnhancedAmlOption::Yes {
            ofac: true,
            pep: false,
            adverse_media: true,
            continuous_monitoring: true,
            adverse_media_lists: Some(vec![
                AdverseMediaListKind::FinancialCrime,
                AdverseMediaListKind::Fraud,
            ]),
        },
        obc.enhanced_aml
    );
}

#[db_test]
pub fn test_document_and_countries_roundtrip(conn: &mut TestPgConn) {
    let t = fixtures::tenant::create(conn);
    let supported = CountrySpecificDocumentMapping(HashMap::from_iter(vec![
        (Iso3166TwoDigitCountryCode::CA, vec![DocumentKind::DriversLicense]),
        (Iso3166TwoDigitCountryCode::MX, vec![DocumentKind::DriversLicense]),
    ]));
    let document_types_and_countries = Some(DocumentAndCountryConfiguration {
        global: vec![DocumentKind::Passport],
        country_specific: supported,
    });

    let opts = ObConfigurationOpts {
        document_types_and_countries: document_types_and_countries.clone(),
        ..Default::default()
    };
    let obc = fixtures::ob_configuration::create_with_opts(conn, &t.id, opts);

    let (obc, _) = ObConfiguration::get(conn, &obc.id).unwrap();
    assert_eq!(document_types_and_countries, obc.document_types_and_countries)
}
