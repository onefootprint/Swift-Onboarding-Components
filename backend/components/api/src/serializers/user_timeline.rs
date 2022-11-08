use db::models::user_timeline::{SaturatedTimelineEvent, UserTimeline, UserTimelineInfo};

use crate::utils::db2api::DbToApi;

impl DbToApi<UserTimelineInfo> for api_wire_types::UserTimeline {
    fn from_db(target: UserTimelineInfo) -> Self {
        let UserTimelineInfo(ut, saturated_event) = target;
        let UserTimeline { timestamp, .. } = ut;
        let event = api_wire_types::UserTimelineEvent::from_db(saturated_event);
        Self { timestamp, event }
    }
}

impl DbToApi<SaturatedTimelineEvent> for api_wire_types::UserTimelineEvent {
    fn from_db(target: SaturatedTimelineEvent) -> Self {
        match target {
            SaturatedTimelineEvent::DataCollected(e) => {
                Self::DataCollected(api_wire_types::user_timeline::DataCollectedInfo {
                    attributes: e.attributes,
                })
            }
            SaturatedTimelineEvent::BiometricRegistered(e) => {
                Self::BiometricRegistered(api_wire_types::LivenessEvent::from_db(e))
            }
            SaturatedTimelineEvent::DocumentUploaded(_) => Self::DocumentUploaded(), // TODO
            SaturatedTimelineEvent::OnboardingDecision((decision, ob_config, vrs, tenant_user)) => {
                Self::OnboardingDecision(api_wire_types::OnboardingDecision::from_db((
                    decision,
                    Some(ob_config),
                    Some(vrs),
                    tenant_user,
                )))
            }
        }
    }
}
