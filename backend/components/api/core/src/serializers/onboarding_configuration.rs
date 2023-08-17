use std::sync::Arc;

use db::models::{appearance::Appearance, ob_configuration::ObConfiguration, tenant::Tenant};
use feature_flag::{BoolFlag, FeatureFlagClient};

use crate::utils::db2api::DbToApi;

pub type ObConfigInfo = (
    ObConfiguration,
    Tenant,
    Option<Appearance>,
    Arc<dyn FeatureFlagClient>,
);

impl DbToApi<ObConfigInfo> for api_wire_types::OnboardingConfiguration {
    fn from_db((ob_config, tenant, appearance, ff_client): ObConfigInfo) -> Self {
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
            ..
        } = ob_config;
        let Tenant {
            name: org_name,
            logo_url,
            privacy_policy_url,
            id: tenant_id,
            ..
        } = tenant;
        let appearance = appearance.map(|a| a.data);
        let is_app_clip_enabled = ff_client.flag(BoolFlag::IsAppClipEnabled(&tenant_id));
        let is_instant_app_enabled = ff_client.flag(BoolFlag::IsInstantAppEnabled(&tenant_id));
        Self {
            id,
            key,
            name,
            org_name,
            logo_url,
            privacy_policy_url,
            must_collect_data,
            optional_data,
            can_access_data,
            is_live,
            created_at,
            status,
            appearance,
            is_app_clip_enabled,
            is_instant_app_enabled,
            tenant_id,
            is_no_phone_flow,
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
