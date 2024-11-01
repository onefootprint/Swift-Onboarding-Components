use crate::onboarding_configs::validation::ObConfigurationArgsToValidate;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::decision::rule_engine;
use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use api_wire_types::Patch;
use db::models::ob_configuration::NewObConfigurationArgs;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::VerificationChecks;
use db::models::rule_set_version::RuleSetVersion;
use newtypes::AuthMethodKind;
use newtypes::CipKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::CollectedDataOptionKind as CDOK;
use newtypes::DocumentAndCountryConfiguration;
use newtypes::DocumentRequestConfig;
use newtypes::EnhancedAml;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::ObConfigurationKind;
use newtypes::VerificationCheck;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
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
    #[serde(default)]
    pub required_auth_methods: Patch<Vec<AuthMethodKind>>,
    pub prompt_for_passkey: Option<bool>,
    #[serde(default)]
    /// Allow the same user to onboard onto this playbook multiple times. It is generally not
    /// recommended to enable this setting. When this is enabled, you lose:
    /// - Protection against one user incurring many charges at your tenant
    /// - Ability for in-progress onboardings to continue where they left off
    /// When false, onboarding will no-op for repeat onboardings.
    pub allow_reonboard: bool,
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

    let pb_request = request.into_inner().validate()?;
    let collects_identity_document = collects_identity_document(&pb_request);

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
        allow_us_residents,
        allow_us_territories,
        skip_confirm,
        document_types_and_countries,
        documents_to_collect,
        business_documents_to_collect,
        curp_validation_enabled,
        enhanced_aml: api_enhanced_aml,
        kind,
        verification_checks,
        required_auth_methods,
        prompt_for_passkey,
        allow_reonboard,
    } = pb_request;


    // TODO: clean this up by surfacing AM lists in FE
    let db_enhanced_aml = api_enhanced_aml.map(|r| r.into());


    // VERIFICATION CHECK MIGRATION: construct verification checks
    let curp_validation_enabled = curp_validation_enabled.unwrap_or(false);
    let verification_checks = VerificationChecks::new(
        tenant_id,
        verification_checks,
        skip_kyc,
        db_enhanced_aml.clone(),
        collects_identity_document,
        curp_validation_enabled,
    );

    let is_no_phone_flow = is_no_phone_flow.unwrap_or(false);

    // TODO remove once client start providing this
    let required_auth_methods = match required_auth_methods {
        Patch::Null => None,
        Patch::Value(v) => Some(v),
        Patch::Missing => match kind {
            // Auth and Document playbooks don't (yet) have an opinion on which login method is used
            ObConfigurationKind::Auth | ObConfigurationKind::Document => None,
            ObConfigurationKind::Kyc | ObConfigurationKind::Kyb => Some(if is_no_phone_flow {
                vec![AuthMethodKind::Email]
            } else {
                vec![AuthMethodKind::Phone]
            }),
        },
    };

    let prompt_for_passkey =
        prompt_for_passkey.unwrap_or(!is_no_phone_flow && kind != ObConfigurationKind::Auth);

    let args = NewObConfigurationArgs {
        name,
        tenant_id: tenant_id.clone(),
        must_collect_data,
        optional_data: optional_data.unwrap_or(vec![]),
        can_access_data,
        is_live,
        cip_kind,
        is_no_phone_flow,
        is_doc_first: is_doc_first_flow,
        allow_international_residents,
        international_country_restrictions,
        author: actor,
        // TODO: remove these once frontend is merged
        allow_us_residents: allow_us_residents.unwrap_or(true),
        allow_us_territory_residents: allow_us_territories.unwrap_or(false),
        kind,
        skip_confirm: skip_confirm.unwrap_or(false),
        document_types_and_countries,
        documents_to_collect,
        business_documents_to_collect,
        verification_checks,
        required_auth_methods,
        prompt_for_passkey,
        allow_reonboard,
    };
    // Need to check Tenants are able to use certain vendors
    let tvc = TenantVendorControl::new(
        tenant.id.clone(),
        &state.db_pool,
        &state.config,
        &state.enclave_client,
    )
    .await?;
    let args = ObConfigurationArgsToValidate::validate(&state, args, &tenant, &tvc)?;
    let ff_client = state.ff_client.clone();
    let (obc, actor, rs) = state
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


fn collects_identity_document(create_obc_req: &CreateOnboardingConfigurationRequest) -> bool {
    let has_document_cdo = create_obc_req
        .must_collect_data
        .iter()
        .any(|d| CDOK::from(d) == CDOK::Document);
    let has_other_document = create_obc_req
        .documents_to_collect
        .iter()
        .any(|c| c.is_identity());
    has_document_cdo || has_other_document
}
