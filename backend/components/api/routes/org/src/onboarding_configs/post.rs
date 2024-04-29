use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::{tenant::TenantError, ApiError, ApiResult},
    onboarding_configs::validation::ObConfigurationArgsToValidate,
    types::response::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{decision::rule_engine, telemetry::RootSpan};
use db::models::{
    ob_configuration::{NewObConfigurationArgs, ObConfiguration},
    rule_set_version::RuleSetVersion,
};
use feature_flag::BoolFlag;
use newtypes::{
    AdverseMediaListKind, CipKind, CollectedDataOption as CDO, DataIdentifierDiscriminant,
    DocumentAndCountryConfiguration, DocumentRequestConfig, EnhancedAml, EnhancedAmlOption,
    Iso3166TwoDigitCountryCode, ObConfigurationKind, TenantId,
};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

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
    #[serde(default)]
    pub skip_kyc: bool,
    #[serde(default)]
    pub doc_scan_for_optional_ssn: Option<CDO>,
    #[serde(default)]
    pub enhanced_aml: Option<EnhancedAml>,
    // TODO: drop this option
    pub allow_us_residents: Option<bool>,
    // TODO: drop this option
    pub allow_us_territories: Option<bool>,
    pub kind: Option<ObConfigurationKind>,
    pub skip_confirm: Option<bool>,
    pub document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    #[serde(default)]
    pub documents_to_collect: Vec<DocumentRequestConfig>,
    #[serde(default)]
    pub curp_validation_enabled: Option<bool>,
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
    root_span: RootSpan,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
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
        curp_validation_enabled,
        enhanced_aml,
        kind,
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

    // Newer auth playbooks will have the kind specified in API
    // TODO deprecate this when we start receiving the kind from all requests
    match &kind {
        None => root_span.record("meta", "without_kind"),
        Some(_) => root_span.record("meta", "with_kind"),
    };
    let is_kyc = must_collect_data
        .iter()
        .all(|d| d.parent().data_identifier_kind() != DataIdentifierDiscriminant::Business);
    let kind = kind.unwrap_or(if is_kyc {
        ObConfigurationKind::Kyc
    } else {
        ObConfigurationKind::Kyb
    });

    // Hard coded for now until we expose in playbooks. TODO: could maybe have "tenant defaults" expressed in our code where we could map tenants to default invariants for them
    // like Coba should always have skip_kyc=true. Probably better than doing this purely via PG or via feature flags
    let skip_kyc = skip_kyc
        || state
            .feature_flag_client
            .flag(BoolFlag::IsSkipKycTenant(tenant_id));

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
        skip_kyc,
        doc_scan_for_optional_ssn,
        enhanced_aml,
        // TODO: remove these once frontend is merged
        allow_us_residents: allow_us_residents.unwrap_or(true),
        allow_us_territory_residents: allow_us_territories.unwrap_or(false),
        kind,
        skip_kyb: false,
        skip_confirm: skip_confirm.unwrap_or(false),
        document_types_and_countries,
        documents_to_collect,
        curp_validation_enabled: curp_validation_enabled.unwrap_or(false),
    };

    let args = ObConfigurationArgsToValidate::validate(&state, args, &tenant)?;
    let ff_client = state.feature_flag_client.clone();
    let (obc, actor, rs) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let obc: ObConfiguration = ObConfiguration::create(conn, args)?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;
            rule_engine::default_rules::save_default_rules_for_obc(conn, &obc, Some(ff_client))?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc.into_inner())?;
            let rs = RuleSetVersion::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.feature_flag_client.clone())),
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
