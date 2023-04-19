use db::models::onboarding::{Onboarding, OnboardingAndConfig, SerializableOnboardingInfo};
use newtypes::DataIdentifier;

use crate::utils::db2api::DbToApi;

impl DbToApi<SerializableOnboardingInfo> for api_wire_types::Onboarding {
    fn from_db((onboarding, config, insight, manual_review): SerializableOnboardingInfo) -> Self {
        let Onboarding {
            id,
            start_timestamp,
            authorized_at,
            ..
        } = onboarding.clone();
        let can_access_identity_document_images = config.can_access_document();
        let db::models::ob_configuration::ObConfiguration {
            id: config_id,
            name,
            can_access_data,
            ..
        } = config.clone();

        let status = onboarding.status;
        let can_decrypt_scopes = OnboardingAndConfig(onboarding, config).can_decrypt_scopes();

        // This is legacy - only shows IDKs. We will deprecate soon
        let can_access_data_attributes = can_access_data
            .iter()
            .flat_map(|x| x.data_identifiers().unwrap_or_default())
            .filter_map(|di| {
                if let DataIdentifier::Id(idk) = di {
                    Some(idk)
                } else {
                    None
                }
            })
            .collect();
        api_wire_types::Onboarding {
            id,
            is_authorized: authorized_at.is_some(),
            name,
            config_id,
            requires_manual_review: manual_review.is_some(),
            status,
            timestamp: start_timestamp,
            insight_event: api_wire_types::InsightEvent::from_db(insight),
            can_access_permissions: can_decrypt_scopes,
            // TODO deprecate
            can_access_data,
            can_access_data_attributes,
            can_access_identity_document_images,
        }
    }
}
