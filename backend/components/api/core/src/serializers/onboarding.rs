use db::models::{onboarding::Onboarding, scoped_vault::SerializableOnboarding};
use newtypes::OnboardingStatus;

use crate::utils::db2api::DbToApi;

impl DbToApi<(SerializableOnboarding, Option<OnboardingStatus>)> for api_wire_types::Onboarding {
    fn from_db(
        ((onboarding, config, insight, manual_review), status): (
            SerializableOnboarding,
            Option<OnboardingStatus>,
        ),
    ) -> Self {
        let Onboarding {
            id,
            start_timestamp,
            authorized_at,
            ..
        } = onboarding;
        let db::models::ob_configuration::ObConfiguration {
            id: config_id, name, ..
        } = config;

        // This isn't super ergonomic. We should just migrate to serialize the status on the Entity
        // rather than on the Onboarding
        let status = status.unwrap_or(OnboardingStatus::Incomplete);

        api_wire_types::Onboarding {
            id,
            is_authorized: authorized_at.is_some(),
            name,
            config_id,
            requires_manual_review: manual_review.is_some(),
            manual_review: manual_review.map(api_wire_types::ManualReview::from_db),
            status,
            timestamp: start_timestamp,
            insight_event: insight.map(api_wire_types::InsightEvent::from_db),
        }
    }
}
