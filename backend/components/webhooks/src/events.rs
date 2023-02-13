use chrono::{DateTime, Utc};
use newtypes::{FootprintUserId, ObConfigurationId, OnboardingStatus};

/// Defines supported webhook event types and payloads
#[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(untagged)]
pub enum WebhookEvent {
    #[strum(serialize = "footprint.onboarding.completed")]
    OnboardingCompleted {
        footprint_user_id: FootprintUserId,
        timestamp: DateTime<Utc>,
        status: OnboardingStatus,
        requires_manual_review: bool,
        onboarding_configuration_id: ObConfigurationId,
    },

    #[strum(serialize = "footprint.onboarding.status_changed")]
    OnboardingStatusChanged {
        footprint_user_id: FootprintUserId,
        timestamp: DateTime<Utc>,
        new_status: OnboardingStatus,
    },
}

impl WebhookEvent {
    pub fn event_type(&self) -> String {
        self.to_string()
    }
}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_raw() {
        let evt = WebhookEvent::OnboardingCompleted {
            footprint_user_id: FootprintUserId::from("test".to_string()),
            timestamp: Utc::now(),
            status: OnboardingStatus::Pass,
            requires_manual_review: false,
            onboarding_configuration_id: ObConfigurationId::default(),
        };

        assert_eq!(evt.event_type().as_str(), "footprint.onboarding.completed")
    }
}
