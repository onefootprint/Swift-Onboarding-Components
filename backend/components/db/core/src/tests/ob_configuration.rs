use crate::diesel::RunQueryDsl;
use crate::models::ob_configuration::NewObConfigurationArgs;
use crate::models::ob_configuration::ObConfiguration;
use crate::models::ob_configuration::ObConfigurationUpdate;
use crate::models::ob_configuration::VerificationChecks;
use crate::models::playbook::Playbook;
use crate::test_helpers::assert_have_same_elements;
use crate::tests::fixtures;
use crate::tests::fixtures::ob_configuration::ObConfigurationOpts;
use crate::tests::prelude::*;
use macros::db_test;
use macros::db_test_case;
use newtypes::AdverseMediaListKind;
use newtypes::AmlMatchKind;
use newtypes::ApiKeyStatus;
use newtypes::CipKind;
use newtypes::CollectedDataOption;
use newtypes::CountrySpecificDocumentMapping;
use newtypes::DbActor;
use newtypes::DocumentAndCountryConfiguration;
use newtypes::DocumentCdoInfo;
use newtypes::EnhancedAmlOption;
use newtypes::IdDocKind;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::Locked;
use newtypes::ObConfigurationKind;
use newtypes::TenantId;
use std::collections::HashMap;
use std::str::FromStr;
use strum::IntoEnumIterator;

#[db_test]
fn test_ob_config(conn: &mut TestPgConn) {
    // Create an ob config
    let tenant = fixtures::tenant::create(conn);
    let (playbook, ob_config) = fixtures::ob_configuration::create(conn, &tenant.id, true);

    // Enforce it exists
    let (_, fetched_ob_config) = ObConfiguration::get_enabled(conn, &ob_config.id).expect("Could not fetch");
    assert_eq!(ob_config.name, fetched_ob_config.name);

    // Mark as inactive
    let update = ObConfigurationUpdate {
        status: Some(ApiKeyStatus::Disabled),
        ..Default::default()
    };
    ObConfiguration::update(conn, &playbook, &ob_config.id, update).expect("Couldn't update");

    // Enforce it does not exist
    ObConfiguration::get_enabled(conn, &ob_config.id).expect_err("Shouldn't find disabled ob config");
}

#[db_test_case(true, true, false, None, Iso3166TwoDigitCountryCode::iter().collect(); "allow international, any country acceptable")]
#[db_test_case(false, false, false, Some(vec![Iso3166TwoDigitCountryCode::MX]), vec![Iso3166TwoDigitCountryCode::MX]; "obc has restrictions")]
#[db_test_case(true, true, false, Some(vec![Iso3166TwoDigitCountryCode::MX]), vec![Iso3166TwoDigitCountryCode::MX, Iso3166TwoDigitCountryCode::US]; "obc has restrictions and allow us")]
#[db_test_case(false, true, false,  None, vec![Iso3166TwoDigitCountryCode::US]; "obc doesn't allow international, only US")]
#[db_test_case(false, true, true,  None, Iso3166TwoDigitCountryCode::all_codes_for_us_including_territories(); "obc is for territories + US")]
#[db_test_case(true, false, false,  None, Iso3166TwoDigitCountryCode::all_international(); "obc is international without US")]
fn test_ob_config_international_countries(
    conn: &mut TestPgConn,
    allow_international: bool,
    allow_us_residents: bool,
    allow_us_territory_residents: bool,
    international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    expected_countries: Vec<Iso3166TwoDigitCountryCode>,
) {
    let args = NewObConfigurationArgs {
        name: "obc".into(),
        must_collect_data: vec![],
        can_access_data: vec![],
        cip_kind: None,
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: allow_international,
        international_country_restrictions,
        author: DbActor::Footprint,
        allow_us_residents,
        allow_us_territory_residents,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        verification_checks: VerificationChecks::default(),
        required_auth_methods: None,
        prompt_for_passkey: true,
    };

    let tenant_id = TenantId::from_str("t_1234").unwrap();
    let (_, obc) = Playbook::create(conn, &tenant_id, true, args).unwrap();

    assert_have_same_elements(
        obc.supported_countries_for_residential_address(),
        expected_countries,
    )
}

fn obc_with_doc_cdo(
    conn: &mut TestPgConn,
    allow_international: bool,
    international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    doc_cdo: &str,
    tenant_id: Option<&str>,
) -> (Locked<Playbook>, ObConfiguration) {
    let args = NewObConfigurationArgs {
        name: "obc".into(),
        must_collect_data: vec![CollectedDataOption::Document(
            DocumentCdoInfo::from_str(doc_cdo).unwrap(),
        )],
        can_access_data: vec![],
        cip_kind: None,
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: allow_international,
        international_country_restrictions,
        author: DbActor::Footprint,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        verification_checks: VerificationChecks::default(),
        required_auth_methods: None,
        prompt_for_passkey: true,
    };

    let tenant_id = TenantId::from_str(tenant_id.unwrap_or("t_1234")).unwrap();
    Playbook::create(conn, &tenant_id, true, args).unwrap()
}

#[db_test_case(None)]
#[db_test_case(Some(Iso3166TwoDigitCountryCode::US))]
fn test_supported_country_mapping_us_only(
    conn: &mut TestPgConn,
    residential_country: Option<Iso3166TwoDigitCountryCode>,
) {
    // We don't allow international
    //
    // We expect by default to return US with the indicated doc types
    //  every other country with just passport
    let (playbook, obc) = obc_with_doc_cdo(
        conn,
        false,
        None,
        "document.drivers_license,passport,id_card.none.require_selfie",
        None,
    );

    let mapping = obc.supported_country_mapping_for_document(&playbook.tenant_id, residential_country);

    // US has the 3 documents indicated
    assert_eq!(
        mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
        vec![IdDocKind::DriversLicense, IdDocKind::Passport, IdDocKind::IdCard]
    );
    // we also allow a passport from any country
    Iso3166TwoDigitCountryCode::iter()
        .filter(|c| !c.is_us_including_territories())
        .for_each(|c| assert_eq!(mapping.get(&c).cloned().unwrap(), vec![IdDocKind::Passport]))
}

#[db_test]
fn test_supported_country_mapping_override_for_coba(conn: &mut TestPgConn) {
    let (playbook, obc) = obc_with_doc_cdo(
        conn,
        false,
        None,
        "document.drivers_license,passport,voter_identification.none.require_selfie",
        Some("org_5lwSs95mU5v3gOU9xdSaml"),
    );

    Iso3166TwoDigitCountryCode::iter()
        .filter(|c| *c != Iso3166TwoDigitCountryCode::MX)
        .for_each(|c| {
            let supported = obc.supported_country_mapping_for_document(&playbook.tenant_id, Some(c));
            assert_eq!(supported.get(&c).cloned().unwrap(), vec![IdDocKind::Passport])
        });

    let supported =
        obc.supported_country_mapping_for_document(&playbook.tenant_id, Some(Iso3166TwoDigitCountryCode::MX));
    assert_have_same_elements(
        supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
        vec![
            IdDocKind::Passport,
            IdDocKind::DriversLicense,
            IdDocKind::VoterIdentification,
        ],
    );
    // Second form of ID: Mexican Resident Card
    let (playbook, obc) = obc_with_doc_cdo(
        conn,
        false,
        None,
        "document.residence_document.none.require_selfie",
        Some("org_5lwSs95mU5v3gOU9xdSaml"),
    );

    let all_supported = obc.supported_country_mapping_for_document(&playbook.tenant_id, None);
    assert_eq!(all_supported.keys().len(), 1);
    assert_have_same_elements(
        all_supported
            .get(&Iso3166TwoDigitCountryCode::MX)
            .cloned()
            .unwrap(),
        vec![IdDocKind::ResidenceDocument],
    );

    let supported =
        obc.supported_country_mapping_for_document(&playbook.tenant_id, Some(Iso3166TwoDigitCountryCode::MX));
    assert_have_same_elements(
        supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
        vec![IdDocKind::ResidenceDocument],
    );

    // Second form of ID: Any additional document (voters ID, drivers license, etc)
    let (_, obc) = obc_with_doc_cdo(
        conn,
        false,
        None,
        "document.drivers_license,voter_identification,visa,id_card,residence_document.none.require_selfie",
        Some("org_5lwSs95mU5v3gOU9xdSaml"),
    );

    let all_supported = obc.supported_country_mapping_for_document(&playbook.tenant_id, None);
    assert_eq!(all_supported.keys().len(), 1);
    assert_have_same_elements(
        all_supported
            .get(&Iso3166TwoDigitCountryCode::MX)
            .cloned()
            .unwrap(),
        vec![
            IdDocKind::ResidenceDocument,
            IdDocKind::DriversLicense,
            IdDocKind::Visa,
            IdDocKind::VoterIdentification,
            IdDocKind::IdCard,
        ],
    );

    let supported =
        obc.supported_country_mapping_for_document(&playbook.tenant_id, Some(Iso3166TwoDigitCountryCode::MX));
    assert_have_same_elements(
        supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
        vec![
            IdDocKind::ResidenceDocument,
            IdDocKind::DriversLicense,
            IdDocKind::Visa,
            IdDocKind::VoterIdentification,
            IdDocKind::IdCard,
        ],
    );

    // Second form of ID: Driver's license
    let (playbook, obc) = obc_with_doc_cdo(
        conn,
        false,
        None,
        "document.drivers_license.none.require_selfie",
        Some("org_5lwSs95mU5v3gOU9xdSaml"),
    );

    let all_supported = obc.supported_country_mapping_for_document(&playbook.tenant_id, None);
    assert_eq!(all_supported.keys().len(), 1);
    assert_have_same_elements(
        all_supported
            .get(&Iso3166TwoDigitCountryCode::MX)
            .cloned()
            .unwrap(),
        vec![IdDocKind::DriversLicense],
    );

    let supported =
        obc.supported_country_mapping_for_document(&playbook.tenant_id, Some(Iso3166TwoDigitCountryCode::MX));
    assert_have_same_elements(
        supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
        vec![IdDocKind::DriversLicense],
    )
}

#[db_test_case(None, None)]
#[db_test_case(Some(Iso3166TwoDigitCountryCode::US), None)]
#[db_test_case(Some(Iso3166TwoDigitCountryCode::MX), None)]
#[db_test_case(Some(Iso3166TwoDigitCountryCode::NO), None)]
#[db_test_case(None, Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
#[db_test_case(Some(Iso3166TwoDigitCountryCode::US), Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
#[db_test_case(Some(Iso3166TwoDigitCountryCode::MX), Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
#[db_test_case(Some(Iso3166TwoDigitCountryCode::NO), Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
fn test_supported_country_mapping_allow_international(
    conn: &mut TestPgConn,
    residential_country: Option<Iso3166TwoDigitCountryCode>,
    international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
) {
    // In this test we allow international, and therefore need to handle residential addresses that are
    // non-US.
    // - in the case we get an international residential address, we only accept passport.
    // - in the case we get a US residential address, we allow DL + passport
    //
    // Note: international country restrictions do not affect the countries you can submit a passport
    // for, this just controls residential address - there are integration tests testing this part
    let (playbook, obc) = obc_with_doc_cdo(
        conn,
        true,
        international_country_restrictions,
        "document.drivers_license,passport.none.require_selfie",
        None,
    );

    let mapping = obc.supported_country_mapping_for_document(&playbook.tenant_id, residential_country);

    match residential_country.map(|c| c.is_us_including_territories()) {
        // country provided
        Some(is_us) => {
            // residential country is the us, we get DL + ppt
            if is_us {
                assert_eq!(
                    mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
                    vec![IdDocKind::DriversLicense, IdDocKind::Passport]
                );
            } else {
                // country is !US, we only can submit US passports
                assert_eq!(
                    mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
                    vec![IdDocKind::Passport]
                );
            }
        }
        // default case where no country yet, US supports all doc types it can
        None => {
            assert_eq!(
                mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
                vec![IdDocKind::DriversLicense, IdDocKind::Passport]
            );
        }
    }

    // in all cases, non-US can just upload passport
    Iso3166TwoDigitCountryCode::iter()
        .filter(|c| !c.is_us_including_territories())
        .for_each(|c| assert_eq!(mapping.get(&c).cloned().unwrap(), vec![IdDocKind::Passport]))
}


#[db_test_case(None, None)]
#[db_test_case(None, Some(Iso3166TwoDigitCountryCode::US))]
#[db_test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::US))]
#[db_test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::PR))]
#[db_test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::GU))]
#[db_test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::CA))]
fn test_cip_kind_documents(
    conn: &mut TestPgConn,
    cip: Option<CipKind>,
    residential_country: Option<Iso3166TwoDigitCountryCode>,
) {
    let args = NewObConfigurationArgs {
        name: "obc".into(),
        must_collect_data: vec![],
        can_access_data: vec![],
        // Testing this!!!
        cip_kind: cip,
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        author: DbActor::Footprint,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        verification_checks: VerificationChecks::default(),
        required_auth_methods: None,
        prompt_for_passkey: true,
    };

    let tenant_id = TenantId::from_str("t_1234").unwrap();
    let (playbook, obc) = Playbook::create(conn, &tenant_id, true, args).unwrap();

    let mapping = obc
        .supported_country_mapping_for_document(&playbook.tenant_id, residential_country)
        .0;
    if let Some(c) = cip {
        match c {
            CipKind::Alpaca => match residential_country {
                Some(country) if country.is_us_territory() => {
                    assert!(mapping.keys().len() == 2);
                    assert_eq!(
                        mapping.get(&Iso3166TwoDigitCountryCode::US).unwrap().clone(),
                        vec![IdDocKind::DriversLicense, IdDocKind::IdCard,]
                    );
                    assert_eq!(
                        mapping.get(&country).unwrap().clone(),
                        vec![IdDocKind::DriversLicense, IdDocKind::IdCard,]
                    );
                }
                Some(_) => {
                    assert!(mapping.keys().len() == 1);
                    assert_eq!(
                        mapping.get(&Iso3166TwoDigitCountryCode::US).unwrap().clone(),
                        vec![IdDocKind::DriversLicense, IdDocKind::IdCard,]
                    );
                }
                None => {
                    assert!(mapping.keys().len() == 1);
                    assert_eq!(
                        mapping.get(&Iso3166TwoDigitCountryCode::US).unwrap().clone(),
                        vec![IdDocKind::DriversLicense, IdDocKind::IdCard,]
                    );
                }
            },
            CipKind::Apex => unimplemented!(),
        }
    } else {
        assert!(mapping.keys().len() > 1);
    }
}

#[db_test]
fn test_document_types_and_countries(conn: &mut TestPgConn) {
    let supported = CountrySpecificDocumentMapping(HashMap::from_iter(vec![(
        Iso3166TwoDigitCountryCode::CA,
        vec![IdDocKind::DriversLicense],
    )]));
    let doc_config = DocumentAndCountryConfiguration {
        global: vec![],
        country_specific: supported,
    };
    let args = NewObConfigurationArgs {
        name: "obc".into(),
        must_collect_data: vec![],
        can_access_data: vec![],
        cip_kind: None,
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        author: DbActor::Footprint,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        // TESTING THIS
        document_types_and_countries: Some(doc_config),
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        verification_checks: VerificationChecks::default(),
        required_auth_methods: None,
        prompt_for_passkey: true,
    };

    let tenant_id = TenantId::from_str("t_1234").unwrap();
    let (playbook, obc) = Playbook::create(conn, &tenant_id, true, args).unwrap();


    let mapping = obc
        .supported_country_mapping_for_document(&playbook.tenant_id, None)
        .0;
    assert_eq!(mapping.keys().len(), 1);
    assert_eq!(
        mapping.get(&Iso3166TwoDigitCountryCode::CA).unwrap().clone(),
        vec![IdDocKind::DriversLicense]
    );
}

#[db_test]
fn test_document_and_countries_field_with_cip_kind(conn: &mut TestPgConn) {
    let supported = CountrySpecificDocumentMapping(HashMap::from_iter(vec![(
        Iso3166TwoDigitCountryCode::PR,
        vec![IdDocKind::Visa],
    )]));
    let doc_config = DocumentAndCountryConfiguration {
        global: vec![],
        country_specific: supported,
    };
    let args = NewObConfigurationArgs {
        name: "obc".into(),
        must_collect_data: vec![],
        can_access_data: vec![],
        // TESTING THIS
        cip_kind: Some(CipKind::Alpaca),
        optional_data: vec![],
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        author: DbActor::Footprint,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_confirm: false,
        // TESTING THIS
        document_types_and_countries: Some(doc_config),
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        verification_checks: VerificationChecks::default(),
        required_auth_methods: None,
        prompt_for_passkey: true,
    };

    let tenant_id = TenantId::from_str("t_1234").unwrap();
    let (playbook, obc) = Playbook::create(conn, &tenant_id, true, args).unwrap();

    // Despite configuring document_types_and_countries on the OBC, we respect the alpaca overrides
    let mapping = obc
        .supported_country_mapping_for_document(&playbook.tenant_id, Some(Iso3166TwoDigitCountryCode::PR))
        .0;
    assert_eq!(mapping.keys().len(), 2);
    // we respect alpaca overrides
    assert_eq!(
        mapping.get(&Iso3166TwoDigitCountryCode::PR).unwrap().clone(),
        vec![IdDocKind::DriversLicense, IdDocKind::IdCard]
    );
}

#[db_test]
pub fn test_enhanced_aml_addition_of_am_lists_is_forwards_compatible(conn: &mut TestPgConn) {
    let t = fixtures::tenant::create(conn);
    let (_, obc) = fixtures::ob_configuration::create(conn, &t.id, true);
    assert_eq!(obc.enhanced_aml_for_test(), EnhancedAmlOption::No);
    diesel::sql_query(format!(
            "update ob_configuration set enhanced_aml={} where id = '{}';",
            r#"'{"data": {"pep": false, "ofac": true, "adverse_media": true, "continuous_monitoring": true, "match_kind": "exact_name"}, "kind": "yes"}'"#, obc.id
        ))
        .execute(conn.conn())
        .unwrap();
    let (_, obc) = ObConfiguration::get(conn, &obc.id).unwrap();
    assert_eq!(
        EnhancedAmlOption::Yes {
            ofac: true,
            pep: false,
            adverse_media: true,
            continuous_monitoring: true,
            adverse_media_lists: None,
            match_kind: AmlMatchKind::ExactName,
        },
        obc.enhanced_aml_for_test()
    );
}

// TODO: update this test for verification checks
#[db_test]
pub fn test_enhanced_aml_addition_of_am_lists_is_backwards_compatible(conn: &mut TestPgConn) {
    let t = fixtures::tenant::create(conn);
    let (_, obc) = fixtures::ob_configuration::create(conn, &t.id, true);
    assert_eq!(obc.enhanced_aml_for_test(), EnhancedAmlOption::No);
    diesel::sql_query(format!(
            "update ob_configuration set enhanced_aml={} where id = '{}';",
            r#"'{"data": {"pep": false, "ofac": true, "adverse_media": true, "continuous_monitoring": true}, "kind": "yes"}'"#, obc.id
        ))
        .execute(conn.conn())
        .unwrap();
    let (_, obc) = ObConfiguration::get(conn, &obc.id).unwrap();
    assert_eq!(
        EnhancedAmlOption::Yes {
            ofac: true,
            pep: false,
            adverse_media: true,
            continuous_monitoring: true,
            adverse_media_lists: None,
            match_kind: AmlMatchKind::ExactName,
        },
        obc.enhanced_aml_for_test()
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
        match_kind: AmlMatchKind::ExactName,
    };
    let (_, obc) = fixtures::ob_configuration::create_with_opts(
        conn,
        &t.id,
        ObConfigurationOpts {
            enhanced_aml: enhanced_aml.clone(),
            ..Default::default()
        },
    );
    assert_eq!(enhanced_aml, obc.enhanced_aml_for_test());

    // since im gunna manually set this in PG for Composer, nice to explicitly test here too
    diesel::sql_query(format!(
            "update ob_configuration set enhanced_aml={} where id = '{}';",
            r#"'{"data": {"pep": false, "ofac": true, "adverse_media": true, "continuous_monitoring": true, "adverse_media_lists": ["financial_crime", "fraud"], "match_kind": "exact_name"}, "kind": "yes"}'"#, obc.id
        ))
        .execute(conn.conn())
        .unwrap();
    let (_, obc) = ObConfiguration::get(conn, &obc.id).unwrap();
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
            match_kind: AmlMatchKind::ExactName
        },
        obc.enhanced_aml_for_test()
    );
}

#[db_test]
pub fn test_document_and_countries_roundtrip(conn: &mut TestPgConn) {
    let t = fixtures::tenant::create(conn);
    let supported = CountrySpecificDocumentMapping(HashMap::from_iter(vec![
        (Iso3166TwoDigitCountryCode::CA, vec![IdDocKind::DriversLicense]),
        (Iso3166TwoDigitCountryCode::MX, vec![IdDocKind::DriversLicense]),
    ]));
    let document_types_and_countries = Some(DocumentAndCountryConfiguration {
        global: vec![IdDocKind::Passport],
        country_specific: supported,
    });

    let opts = ObConfigurationOpts {
        document_types_and_countries: document_types_and_countries.clone(),
        ..Default::default()
    };
    let (_, obc) = fixtures::ob_configuration::create_with_opts(conn, &t.id, opts);

    let (_, obc) = ObConfiguration::get(conn, &obc.id).unwrap();
    assert_eq!(document_types_and_countries, obc.document_types_and_countries)
}
