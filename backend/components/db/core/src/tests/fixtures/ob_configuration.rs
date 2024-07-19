use crate::models::ob_configuration::NewObConfigurationArgs;
use crate::models::ob_configuration::ObConfiguration;
use crate::models::ob_configuration::VerificationChecks;
use crate::PgConn;
use newtypes::CipKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::DbActor;
use newtypes::DocumentAndCountryConfiguration;
use newtypes::EnhancedAmlOption;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::ObConfigurationKind;
use newtypes::TenantId;
use newtypes::VerificationCheck;

pub fn create(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> ObConfiguration {
    let args = NewObConfigurationArgs {
        name: "Flerp config".to_owned(),
        tenant_id: tenant_id.clone(),
        must_collect_data: vec![CDO::PhoneNumber],
        optional_data: vec![],
        can_access_data: vec![CDO::PhoneNumber],
        is_live,
        cip_kind: None,
        is_no_phone_flow: false,
        is_doc_first: false,
        allow_international_residents: false,
        international_country_restrictions: None,
        author: DbActor::Footprint,
        doc_scan_for_optional_ssn: None,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind: ObConfigurationKind::Kyc,
        skip_kyb: false,
        skip_confirm: false,
        document_types_and_countries: None,
        documents_to_collect: vec![],
        business_documents_to_collect: vec![],
        curp_validation_enabled: false,
        verification_checks: VerificationChecks::default(),
    };
    ObConfiguration::create(conn, args).expect("Could not create ob config")
}

pub struct ObConfigurationOpts {
    pub name: String,
    pub must_collect_data: Vec<CDO>,
    pub optional_data: Vec<CDO>,
    pub can_access_data: Vec<CDO>,
    pub is_live: bool,
    pub cip_kind: Option<CipKind>,
    pub is_no_phone_flow: bool,
    pub is_doc_first: bool,
    pub allow_international_residents: bool,
    pub international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    pub author: DbActor,
    pub skip_kyc: bool,
    pub doc_scan_for_optional_ssn: Option<CDO>,
    pub enhanced_aml: EnhancedAmlOption,
    pub kind: ObConfigurationKind,
    pub document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    pub verification_checks: Option<Vec<VerificationCheck>>,
}

impl Default for ObConfigurationOpts {
    fn default() -> Self {
        Self {
            name: "Flerp config".to_owned(),
            must_collect_data: vec![CDO::PhoneNumber],
            optional_data: vec![],
            can_access_data: vec![CDO::PhoneNumber],
            is_live: false,
            cip_kind: None,
            is_no_phone_flow: false,
            is_doc_first: false,
            allow_international_residents: false,
            international_country_restrictions: None,
            author: DbActor::Footprint,
            skip_kyc: false,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: EnhancedAmlOption::No,
            kind: ObConfigurationKind::Kyc,
            document_types_and_countries: None,
            verification_checks: None,
        }
    }
}

pub fn create_with_opts(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    opts: ObConfigurationOpts,
) -> ObConfiguration {
    let ObConfigurationOpts {
        name,
        must_collect_data,
        optional_data,
        can_access_data,
        is_live,
        cip_kind,
        is_no_phone_flow,
        is_doc_first,
        allow_international_residents,
        international_country_restrictions,
        author,
        // TODO: we still use this to create verification checks, should stop to be consistent
        skip_kyc,
        doc_scan_for_optional_ssn,
        enhanced_aml,
        kind,
        document_types_and_countries,
        verification_checks,
    } = opts;
    let documents_to_collect = vec![];
    let skip_kyb = false;
    let curp_validation_enabled = false;
    let verification_checks =
        VerificationChecks::new(verification_checks, Some(skip_kyc), enhanced_aml.clone());
    let args = NewObConfigurationArgs {
        name,
        tenant_id: tenant_id.clone(),
        must_collect_data,
        optional_data,
        can_access_data,
        is_live,
        cip_kind,
        is_no_phone_flow,
        is_doc_first,
        allow_international_residents,
        international_country_restrictions,
        author,
        doc_scan_for_optional_ssn,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind,
        skip_kyb,
        skip_confirm: false,
        document_types_and_countries,
        documents_to_collect,
        business_documents_to_collect: vec![],
        curp_validation_enabled,
        verification_checks,
    };
    ObConfiguration::create(conn, args).expect("Could not create ob config")
}
