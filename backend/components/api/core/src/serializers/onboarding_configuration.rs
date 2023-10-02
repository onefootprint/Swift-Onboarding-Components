use std::sync::Arc;

use api_wire_types::Actor;
use db::{
    actor::SaturatedActor,
    models::{
        appearance::Appearance, ob_configuration::ObConfiguration, tenant::Tenant,
        tenant_client_config::TenantClientConfig,
    },
};
use feature_flag::{BoolFlag, FeatureFlagClient};
use newtypes::DataIdentifierDiscriminant;

use crate::utils::db2api::DbToApi;

pub type ObConfigInfo = (
    ObConfiguration,
    Tenant,
    Option<TenantClientConfig>,
    Option<Appearance>,
    Arc<dyn FeatureFlagClient>,
);

impl DbToApi<ObConfigInfo> for api_wire_types::PublicOnboardingConfiguration {
    fn from_db((ob_config, tenant, tenant_client_config, appearance, ff_client): ObConfigInfo) -> Self {
        let supported_countries = ob_config.supported_countries_for_residential_address();

        let ObConfiguration {
            name,
            key,
            status,
            is_live,
            is_no_phone_flow,
            must_collect_data,
            allow_international_residents,
            doc_scan_for_optional_ssn,
            ..
        } = ob_config;
        let Tenant {
            name: org_name,
            logo_url,
            privacy_policy_url,
            id: tenant_id,
            app_clip_experience_id,
            ..
        } = tenant;
        let appearance = appearance.map(|a| a.data);
        // we only need to tell FE about this if we're in the skip ssn step up flow
        let doc_scan_required_if_ssn_skipped = doc_scan_for_optional_ssn.map(|_| true);
        let is_app_clip_enabled = ff_client.flag(BoolFlag::IsAppClipEnabled(&tenant_id));
        let is_instant_app_enabled = ff_client.flag(BoolFlag::IsInstantAppEnabled(&tenant_id));
        let can_make_real_doc_scan_calls_in_sandbox = (!ob_config.is_live)
            .then(|| ff_client.flag(BoolFlag::CanMakeDemoIncodeRequestsInSandbox(&tenant_id)))
            .unwrap_or(false);
        let is_kyb = must_collect_data
            .iter()
            .any(|cdo| cdo.parent().data_identifier_kind() == DataIdentifierDiscriminant::Business);
        let requires_id_doc = must_collect_data
            .iter()
            .any(|cdo| cdo.parent().data_identifier_kind() == DataIdentifierDiscriminant::Document);
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
            can_make_real_doc_scan_calls_in_sandbox,
            allowed_origins: tenant_client_config.map(|c| c.allowed_origins),
            requires_id_doc,
            is_kyb,
            app_clip_experience_id,
            allow_international_residents,
            supported_countries,
            doc_scan_required_if_ssn_skipped,
        }
    }
}

impl DbToApi<(ObConfiguration, Option<SaturatedActor>)> for api_wire_types::OnboardingConfiguration {
    fn from_db((ob_config, author): (ObConfiguration, Option<SaturatedActor>)) -> Self {
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
            skip_kyc,
            enhanced_aml,
            allow_us_residents,
            allow_us_territory_residents,
            tenant_id: _,
            _created_at: _,
            _updated_at: _,
            appearance_id: _,
            cip_kind: _,
            author: _,
            doc_scan_for_optional_ssn,
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
            enhanced_aml: enhanced_aml.into(),
            allow_us_residents,
            allow_us_territory_residents,
            doc_scan_for_optional_ssn,
        }
    }
}

impl DbToApi<ObConfiguration> for api_wire_types::LiteObConfiguration {
    fn from_db(ob_configuration: ObConfiguration) -> Self {
        let ObConfiguration {
            must_collect_data, ..
        } = ob_configuration;
        api_wire_types::LiteObConfiguration { must_collect_data }
    }
}
