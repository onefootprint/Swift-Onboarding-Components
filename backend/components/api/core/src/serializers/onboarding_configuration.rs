use db::models::{appearance::Appearance, ob_configuration::ObConfiguration, tenant::Tenant};

use crate::utils::db2api::DbToApi;

impl DbToApi<(ObConfiguration, Tenant, Option<Appearance>)> for api_wire_types::OnboardingConfiguration {
    fn from_db((ob_config, tenant, appearance): (ObConfiguration, Tenant, Option<Appearance>)) -> Self {
        let ObConfiguration {
            id,
            key,
            name,
            created_at,
            must_collect_data,
            status,
            can_access_data,
            is_live,
            ..
        } = ob_config;
        let Tenant {
            name: org_name,
            logo_url,
            privacy_policy_url,
            ..
        } = tenant;
        let appearance = appearance.map(|a| a.data);
        Self {
            id,
            key,
            name,
            org_name,
            logo_url,
            privacy_policy_url,
            must_collect_data,
            can_access_data,
            is_live,
            created_at,
            status,
            appearance,
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
