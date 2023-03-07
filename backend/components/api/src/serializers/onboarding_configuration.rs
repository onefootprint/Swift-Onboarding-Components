use db::models::{ob_configuration::ObConfiguration, tenant::Tenant};

use crate::utils::db2api::DbToApi;

impl DbToApi<(ObConfiguration, Tenant)> for api_wire_types::OnboardingConfiguration {
    fn from_db((ob_config, tenant): (ObConfiguration, Tenant)) -> Self {
        let must_collect_identity_document = ob_config.must_collect_document();
        let must_collect_selfie = ob_config.must_collect_selfie();
        let can_access_identity_document_images = ob_config.can_access_document();
        let can_access_selfie_image = ob_config.can_access_selfie();
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
        Self {
            id,
            key,
            name,
            org_name,
            logo_url,
            privacy_policy_url,
            must_collect_data,
            can_access_data,
            must_collect_identity_document,
            can_access_identity_document_images,
            must_collect_selfie,
            can_access_selfie_image,
            is_live,
            created_at,
            status,
        }
    }
}

impl DbToApi<ObConfiguration> for api_wire_types::LiteObConfiguration {
    fn from_db(ob_configuration: ObConfiguration) -> Self {
        let must_collect_identity_document = ob_configuration.must_collect_document();
        let must_collect_selfie = ob_configuration.must_collect_selfie();
        let ObConfiguration {
            must_collect_data, ..
        } = ob_configuration;
        api_wire_types::LiteObConfiguration {
            must_collect_data,
            must_collect_identity_document,
            must_collect_selfie,
        }
    }
}
