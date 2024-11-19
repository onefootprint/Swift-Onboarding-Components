use crate::models::ob_configuration::NewObConfigurationArgs;
use crate::models::ob_configuration::ObConfiguration;
use crate::models::ob_configuration::VerificationChecks;
use crate::models::playbook::Playbook;
use crate::TxnPgConn;
use newtypes::CipKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::CollectedDataOptionKind as CDOK;
use newtypes::DbActor;
use newtypes::DocumentAndCountryConfiguration;
use newtypes::EnhancedAmlOption;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::Locked;
use newtypes::ObConfigurationKind;
use newtypes::TenantId;
use newtypes::VerificationCheck;

pub fn create(
    conn: &mut TxnPgConn,
    tenant_id: &TenantId,
    is_live: bool,
) -> (Locked<Playbook>, ObConfiguration) {
    let args = NewObConfigurationArgs {
        name: "Flerp config".to_owned(),
        must_collect_data: vec![CDO::PhoneNumber],
        optional_data: vec![],
        can_access_data: vec![CDO::PhoneNumber],
        cip_kind: None,
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

    Playbook::create(conn, tenant_id, is_live, args).expect("Could not create ob config history")
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
            enhanced_aml: EnhancedAmlOption::No,
            kind: ObConfigurationKind::Kyc,
            document_types_and_countries: None,
            verification_checks: None,
        }
    }
}

pub fn create_with_opts(
    conn: &mut TxnPgConn,
    tenant_id: &TenantId,
    opts: ObConfigurationOpts,
) -> (Locked<Playbook>, ObConfiguration) {
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
        enhanced_aml,
        kind,
        document_types_and_countries,
        verification_checks,
    } = opts;
    let documents_to_collect = vec![];
    let curp_validation_enabled = false;
    let collects_identity_doc = must_collect_data.iter().any(|d| CDOK::from(d) == CDOK::Document);
    let verification_checks = VerificationChecks::new(
        tenant_id,
        verification_checks,
        Some(skip_kyc),
        Some(enhanced_aml.clone()),
        collects_identity_doc,
        curp_validation_enabled,
    );
    let args = NewObConfigurationArgs {
        name,
        must_collect_data,
        optional_data,
        can_access_data,
        cip_kind,
        is_no_phone_flow,
        is_doc_first,
        allow_international_residents,
        international_country_restrictions,
        author,
        allow_us_residents: true,
        allow_us_territory_residents: false,
        kind,
        skip_confirm: false,
        document_types_and_countries,
        documents_to_collect,
        business_documents_to_collect: vec![],
        verification_checks,
        required_auth_methods: None,
        prompt_for_passkey: true,
    };

    Playbook::create(conn, tenant_id, is_live, args).unwrap()
}
