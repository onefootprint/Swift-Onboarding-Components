use crate::onboarding_configs::validation::ObConfigurationArgsToValidate;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::decision::rule_engine;
use api_core::errors::tenant::TenantError;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use db::models::ob_configuration::NewObConfigurationArgs;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::VerificationChecksForObc;
use db::models::rule_set_version::RuleSetVersion;
use newtypes::AdverseMediaListKind;
use newtypes::CipKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::DocumentAndCountryConfiguration;
use newtypes::DocumentRequestConfig;
use newtypes::EnhancedAml;
use newtypes::EnhancedAmlOption;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::ObConfigurationKind;
use newtypes::TenantId;
use newtypes::VerificationCheck;
use newtypes::VerificationCheckKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationRequest {
    pub name: String,
    pub must_collect_data: Vec<CDO>,
    pub optional_data: Option<Vec<CDO>>,
    pub can_access_data: Vec<CDO>,
    pub cip_kind: Option<CipKind>,
    pub is_no_phone_flow: Option<bool>,
    #[serde(default)]
    pub is_doc_first_flow: bool,
    #[serde(default)]
    pub allow_international_residents: bool,
    pub international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    pub skip_kyc: Option<bool>,
    #[serde(default)]
    pub doc_scan_for_optional_ssn: Option<CDO>,
    #[serde(default)]
    pub enhanced_aml: Option<EnhancedAml>,
    // TODO: drop this option
    pub allow_us_residents: Option<bool>,
    // TODO: drop this option
    pub allow_us_territories: Option<bool>,
    pub kind: ObConfigurationKind,
    pub skip_confirm: Option<bool>,
    pub document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    #[serde(default)]
    pub documents_to_collect: Vec<DocumentRequestConfig>,
    #[serde(default)]
    pub business_documents_to_collect: Vec<DocumentRequestConfig>,
    #[serde(default)]
    pub curp_validation_enabled: Option<bool>,
    #[serde(default)]
    pub verification_checks: Option<Vec<VerificationCheck>>,
}

#[api_v2_operation(
    description = "Creates a new onboarding configuration.",
    tags(Playbooks, Organization, Private)
)]
#[post("/org/onboarding_configs")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let is_live = auth.is_live()?;
    let tenant = auth.tenant().clone();
    let tenant_id = &tenant.id;
    let actor = auth.actor().into();

    let CreateOnboardingConfigurationRequest {
        name,
        must_collect_data,
        optional_data,
        can_access_data,
        cip_kind,
        is_no_phone_flow,
        is_doc_first_flow,
        allow_international_residents,
        international_country_restrictions,
        skip_kyc,
        doc_scan_for_optional_ssn,
        allow_us_residents,
        allow_us_territories,
        skip_confirm,
        document_types_and_countries,
        documents_to_collect,
        business_documents_to_collect,
        curp_validation_enabled,
        enhanced_aml,
        kind,
        verification_checks,
    } = request.into_inner();

    // First, map some of the API format to the format we write to the DB
    if let Some(r) = &enhanced_aml {
        if !r.enhanced_aml && (r.adverse_media || r.ofac || r.pep) {
            return Err(TenantError::ValidationError(
                "cannot set adverse_media, ofac, or pep if enhanced_aml = false".to_owned(),
            )
            .into());
        }
        if r.enhanced_aml && !(r.adverse_media || r.ofac || r.pep) {
            return Err(TenantError::ValidationError(
                "at least one of adverse_media, ofac, or pep must be set if enhanced_aml = true".to_owned(),
            )
            .into());
        }
    }
    let enhanced_aml = enhanced_aml
        .map(|r| r.into())
        .or(hardcoded_tenant_enhanced_aml_option(tenant_id))
        .unwrap_or(EnhancedAmlOption::No);

    let verification_checks = VerificationChecksForObc::new(verification_checks, skip_kyc);

    let skip_kyb = match kind {
        ObConfigurationKind::Kyb => !verification_checks
            .inner()
            .iter()
            .any(|c| matches!(c.into(), VerificationCheckKind::Kyb)),
        _ => false,
    };
    let curp_validation_enabled = curp_validation_enabled.unwrap_or(false);

    let args = NewObConfigurationArgs {
        name,
        tenant_id: tenant_id.clone(),
        must_collect_data,
        optional_data: optional_data.unwrap_or(vec![]),
        can_access_data,
        is_live,
        cip_kind,
        is_no_phone_flow: is_no_phone_flow.unwrap_or(false),
        is_doc_first: is_doc_first_flow,
        allow_international_residents,
        international_country_restrictions,
        author: actor,
        doc_scan_for_optional_ssn,
        enhanced_aml,
        // TODO: remove these once frontend is merged
        allow_us_residents: allow_us_residents.unwrap_or(true),
        allow_us_territory_residents: allow_us_territories.unwrap_or(false),
        kind,
        skip_kyb,
        skip_confirm: skip_confirm.unwrap_or(false),
        document_types_and_countries,
        documents_to_collect,
        business_documents_to_collect,
        curp_validation_enabled,
        verification_checks,
    };

    let args = ObConfigurationArgsToValidate::validate(&state, args, &tenant)?;
    let ff_client = state.ff_client.clone();
    let (obc, actor, rs) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let obc: ObConfiguration = ObConfiguration::create(conn, args)?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;
            rule_engine::default_rules::save_default_rules_for_obc(conn, &obc, Some(ff_client))?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc.into_inner())?;
            let rs = RuleSetVersion::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;

    Ok(api_wire_types::OnboardingConfiguration::from_db((
        obc,
        actor,
        rs,
        state.ff_client.clone(),
    )))
}

fn hardcoded_tenant_enhanced_aml_option(tenant_id: &TenantId) -> Option<EnhancedAmlOption> {
    if tenant_id.is_coba() {
        Some(EnhancedAmlOption::Yes {
            ofac: true,
            pep: true,
            adverse_media: false,
            continuous_monitoring: true,
            adverse_media_lists: None,
        })
    } else if tenant_id.is_composer() {
        Some(EnhancedAmlOption::Yes {
            ofac: true,
            pep: true,
            adverse_media: true,
            continuous_monitoring: false,
            adverse_media_lists: Some(vec![
                AdverseMediaListKind::FinancialCrime,
                AdverseMediaListKind::Fraud,
            ]),
        })
    } else {
        None
    }
}
