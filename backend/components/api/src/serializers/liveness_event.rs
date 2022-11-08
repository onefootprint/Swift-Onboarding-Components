use db::models::{insight_event::InsightEvent, webauthn_credential::WebauthnCredential};

use crate::utils::db2api::DbToApi;

impl DbToApi<(WebauthnCredential, InsightEvent)> for api_wire_types::LivenessEvent {
    fn from_db((_, insight_event): (WebauthnCredential, InsightEvent)) -> Self {
        Self {
            insight_event: api_wire_types::InsightEvent::from_db(insight_event),
        }
    }
}
