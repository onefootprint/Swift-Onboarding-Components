use db::models::{insight_event::InsightEvent, liveness_event::LivenessEvent};

use crate::utils::db2api::DbToApi;

impl DbToApi<(LivenessEvent, InsightEvent)> for api_wire_types::LivenessEvent {
    fn from_db((event, insight_event): (LivenessEvent, InsightEvent)) -> Self {
        Self {
            source: event.liveness_source,
            attributes: event.attributes,
            insight_event: api_wire_types::InsightEvent::from_db(insight_event),
        }
    }
}
