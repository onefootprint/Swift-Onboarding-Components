use crate::PgConn;
use newtypes::{
    CipKind, CollectedDataOption as CDO, DbActor, DocumentAndCountryConfiguration, EnhancedAmlOption,
    Iso3166TwoDigitCountryCode, ObConfigurationKind, TenantId,
};

use crate::models::ob_configuration::ObConfiguration;

pub fn create(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> ObConfiguration {
    ObConfiguration::create(
        conn,
        "Flerp config".to_owned(),
        tenant_id.clone(),
        vec![CDO::PhoneNumber],
        vec![],
        vec![CDO::PhoneNumber],
        is_live,
        None,
        false,
        false,
        false,
        None,
        DbActor::Footprint,
        false,
        None,
        EnhancedAmlOption::No,
        true,
        false,
        ObConfigurationKind::Kyc,
        false,
        false,
        None,
        vec![],
    )
    .expect("Could not create ob config")
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
        }
    }
}

pub fn create_with_opts(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    opts: ObConfigurationOpts,
) -> ObConfiguration {
    ObConfiguration::create(
        conn,
        opts.name,
        tenant_id.clone(),
        opts.must_collect_data,
        opts.optional_data,
        opts.can_access_data,
        opts.is_live,
        opts.cip_kind,
        opts.is_no_phone_flow,
        opts.is_doc_first,
        opts.allow_international_residents,
        opts.international_country_restrictions,
        opts.author,
        opts.skip_kyc,
        opts.doc_scan_for_optional_ssn,
        opts.enhanced_aml,
        true,
        false,
        opts.kind,
        false,
        false,
        opts.document_types_and_countries,
        vec![],
    )
    .expect("Could not create ob config")
}
