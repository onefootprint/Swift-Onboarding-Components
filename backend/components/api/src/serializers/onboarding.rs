use db::models::onboarding::{Onboarding, OnboardingAndConfig, SerializableOnboardingInfo};
use newtypes::DataIdentifier;
use newtypes::LivenessSource;

use crate::utils::db2api::DbToApi;

impl DbToApi<SerializableOnboardingInfo> for api_wire_types::Onboarding {
    fn from_db(
        (onboarding, config, (_, liveness_event), insight, manual_review, latest_decision): SerializableOnboardingInfo,
    ) -> Self {
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
            is_liveness_skipped: liveness_event
                .map(|s| matches!(s.liveness_source, LivenessSource::Skipped))
                .unwrap_or_default(),
            insight_event: api_wire_types::InsightEvent::from_db(insight),
            can_access_permissions: can_decrypt_scopes,
            latest_decision: latest_decision.map(api_wire_types::OnboardingDecision::from_db),
            // TODO deprecate
            can_access_data,
            can_access_data_attributes,
            can_access_identity_document_images,
        }
    }
}
