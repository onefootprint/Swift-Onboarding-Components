use db::models::{insight_event::InsightEvent, liveness_event::LivenessEvent};

use crate::utils::db2api::DbToApi;

impl DbToApi<(LivenessEvent, Option<InsightEvent>)> for api_wire_types::LivenessEvent {
    fn from_db((event, insight_event): (LivenessEvent, Option<InsightEvent>)) -> Self {
        Self {
            source: event.liveness_source,
            attributes: event.attributes,
            insight_event: insight_event.map(api_wire_types::InsightEvent::from_db),
        }
    }
}
