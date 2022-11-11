use db::models::onboarding::{Onboarding, SerializableOnboardingInfo};
use newtypes::LivenessSource;

use crate::utils::db2api::DbToApi;

impl DbToApi<SerializableOnboardingInfo> for api_wire_types::Onboarding {
    fn from_db(
        (onboarding, config, liveness_event, insight, manual_review, latest_decision): SerializableOnboardingInfo,
    ) -> Self {
        let Onboarding { start_timestamp, .. } = onboarding;
        let ob_status = Onboarding::status(latest_decision.as_ref().map(|d| &d.0), manual_review.as_ref());
        let db::models::ob_configuration::ObConfiguration {
            name,
            can_access_data,
            can_access_identity_document_images,
            ..
        } = config;

        let can_access_data_attributes = can_access_data.iter().flat_map(|x| x.attributes()).collect();
        api_wire_types::Onboarding {
            id: onboarding.id,
            name,
            config_id: config.id,
            status: ob_status,
            timestamp: start_timestamp,
            is_liveness_skipped: liveness_event
                .map(|s| matches!(s.liveness_source, LivenessSource::Skipped))
                .unwrap_or_default(),
            insight_event: api_wire_types::InsightEvent::from_db(insight),
            can_access_data,
            can_access_data_attributes,
            can_access_identity_document_images,
            latest_decision: latest_decision.map(api_wire_types::OnboardingDecision::from_db),
        }
    }
}
