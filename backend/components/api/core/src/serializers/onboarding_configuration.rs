use crate::utils::db2api::DbToApi;
use api_wire_types::Actor;
use api_wire_types::HostedWorkflowRequest;
use db::actor::SaturatedActor;
use db::models::appearance::Appearance;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_set_version::RuleSetVersion;
use db::models::tenant::Tenant;
use db::models::tenant_client_config::TenantClientConfig;
use db::models::workflow_request::WorkflowRequest;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use newtypes::DataIdentifierDiscriminant as DID;
use newtypes::VerificationCheckKind;
use std::sync::Arc;

type StepupEnabledInSandboxOutcomes = bool;
pub type ObConfigInfo = (
    ObConfiguration,
    Tenant,
    Option<WorkflowRequest>,
    Option<TenantClientConfig>,
    Option<Appearance>,
    Arc<dyn FeatureFlagClient>,
    StepupEnabledInSandboxOutcomes,
);

impl DbToApi<ObConfigInfo> for api_wire_types::PublicOnboardingConfiguration {
    fn from_db(
        (ob_config, tenant, wfr, tenant_client_config, appearance, ff_client, is_stepup_enabled): ObConfigInfo,
    ) -> Self {
        let supported_countries = ob_config.supported_countries_for_residential_address();
        let required_auth_methods = ob_config.required_auth_methods.clone();
        let nid_enabled = ob_config
            .verification_checks()
            .get(VerificationCheckKind::NeuroId)
            .map(|_| true);

        let ObConfiguration {
            name,
            key,
            status,
            is_live,
            is_no_phone_flow,
            skip_confirm,
            must_collect_data,
            allow_international_residents,
            kind,
            ..
        } = ob_config;
        let Tenant {
            name: org_name,
            logo_url,
            privacy_policy_url,
            id: tenant_id,
            app_clip_experience_id,
            support_email,
            support_phone,
            support_website,
            ..
        } = tenant;
        let appearance = appearance.map(|a| a.data);
        // we only need to tell FE about this if we're in the skip ssn step up flow
        let is_app_clip_enabled = ff_client.flag(BoolFlag::IsAppClipEnabled(&tenant_id));
        let is_instant_app_enabled = ff_client.flag(BoolFlag::IsInstantAppEnabled(&tenant_id));
        let can_make_real_doc_scan_calls_in_sandbox = (!ob_config.is_live)
            .then(|| ff_client.flag(BoolFlag::CanMakeDemoIncodeRequestsInSandbox(&tenant_id)))
            .unwrap_or(false);
        let is_kyb = must_collect_data.iter().any(|cdo| cdo.matches(DID::Business));
        let requires_id_doc = must_collect_data.iter().any(|cdo| cdo.matches(DID::Document));


        Self {
            name,
            key,
            org_name,
            org_id: tenant_id,
            logo_url,
            privacy_policy_url,
            is_live,
            status,
            appearance,
            is_app_clip_enabled,
            is_instant_app_enabled,
            is_no_phone_flow,
            skip_confirm,
            can_make_real_doc_scan_calls_in_sandbox,
            allowed_origins: tenant_client_config.map(|c| c.allowed_origins),
            requires_id_doc,
            is_kyb,
            app_clip_experience_id,
            allow_international_residents,
            supported_countries,
            is_stepup_enabled,
            kind,
            support_email,
            support_phone,
            support_website,
            required_auth_methods,
            nid_enabled,
            workflow_request: wfr.map(HostedWorkflowRequest::from_db),
        }
    }
}

impl DbToApi<WorkflowRequest> for HostedWorkflowRequest {
    fn from_db(wfr: WorkflowRequest) -> Self {
        Self {
            note: wfr.note,
            config: wfr.config,
        }
    }
}

impl
    DbToApi<(
        ObConfiguration,
        Option<SaturatedActor>,
        Option<RuleSetVersion>,
        Arc<dyn FeatureFlagClient>,
    )> for api_wire_types::OnboardingConfiguration
{
    fn from_db(
        (ob_config, author, rule_set, _ff_client): (
            ObConfiguration,
            Option<SaturatedActor>,
            Option<RuleSetVersion>,
            Arc<dyn FeatureFlagClient>,
        ),
    ) -> Self {
        let vc = ob_config.verification_checks();
        let skip_kyc = vc.skip_kyc();
        let enhanced_aml = vc.enhanced_aml();
        let skip_kyb = vc.skip_kyc();
        let curp_validation_enabled = vc.is_enabled(VerificationCheckKind::CurpValidation);
        let ObConfiguration {
            id,
            key,
            name,
            created_at,
            must_collect_data,
            status,
            can_access_data,
            is_live,
            optional_data,
            is_no_phone_flow,
            allow_international_residents,
            international_country_restrictions,
            is_doc_first,
            skip_confirm,
            allow_us_residents,
            allow_us_territory_residents,
            kind,
            document_types_and_countries,
            documents_to_collect,
            business_documents_to_collect,
            cip_kind,
            verification_checks,
            required_auth_methods,
            prompt_for_passkey,
            allow_reonboard,

            // explicitly enumerating unused fields here so we don't forget to expose
            tenant_id: _,
            _created_at: _,
            _updated_at: _,
            appearance_id: _,
            author: _,
            // TODO: only thing hidden here is enhanced_aml and skip_kyb which will be removed shortly
            ..
        } = ob_config;

        Self {
            id,
            key,
            name,
            must_collect_data,
            optional_data,
            can_access_data,
            is_live,
            created_at,
            status,
            is_no_phone_flow,
            is_doc_first_flow: is_doc_first,
            allow_international_residents,
            international_country_restrictions,
            author: author.map(Actor::from_db),
            skip_kyc,
            skip_kyb,
            skip_confirm,
            enhanced_aml: enhanced_aml.into(),
            allow_us_residents,
            allow_us_territory_residents,
            kind,
            is_rules_enabled: true,
            document_types_and_countries,
            rule_set: rule_set.map(|rs| api_wire_types::RuleSet { version: rs.version }),
            cip_kind,
            documents_to_collect: documents_to_collect.unwrap_or_default(),
            business_documents_to_collect,
            curp_validation_enabled,
            verification_checks: verification_checks.unwrap_or_default(),
            required_auth_methods,
            prompt_for_passkey,
            allow_reonboard,
        }
    }
}

impl DbToApi<ObConfiguration> for api_wire_types::TimelinePlaybook {
    fn from_db(ob_configuration: ObConfiguration) -> Self {
        let ObConfiguration {
            id,
            name,
            must_collect_data,
            ..
        } = ob_configuration;
        api_wire_types::TimelinePlaybook {
            id,
            name,
            must_collect_data,
        }
    }
}
