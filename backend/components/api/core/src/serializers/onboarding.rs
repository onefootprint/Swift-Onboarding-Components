use db::models::{
    onboarding::{Onboarding, OnboardingAndConfig},
    scoped_vault::SerializableOnboarding,
};

use crate::utils::db2api::DbToApi;

impl DbToApi<SerializableOnboarding> for api_wire_types::Onboarding {
    fn from_db((onboarding, config, insight, manual_review): SerializableOnboarding) -> Self {
        let Onboarding {
            id,
            start_timestamp,
            authorized_at,
            ..
        } = onboarding.clone();
        let db::models::ob_configuration::ObConfiguration {
            id: config_id, name, ..
        } = config.clone();

        let status = onboarding.status;
        let can_decrypt_scopes = OnboardingAndConfig(onboarding, config).can_decrypt_scopes();

        api_wire_types::Onboarding {
            id,
            is_authorized: authorized_at.is_some(),
            name,
            config_id,
            requires_manual_review: manual_review.is_some(),
            status,
            timestamp: start_timestamp,
            insight_event: api_wire_types::InsightEvent::from_db(insight),
            // TODO deprecate
            can_access_permissions: can_decrypt_scopes,
        }
    }
}
