use db::models::{insight_event::InsightEvent, webauthn_credential::WebauthnCredential};
use paperclip::actix::Apiv2Schema;

use super::insight_event::ApiInsightEvent;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiLiveness {
    pub insight_event: ApiInsightEvent,
}

impl From<(WebauthnCredential, InsightEvent)> for ApiLiveness {
    fn from(s: (WebauthnCredential, InsightEvent)) -> Self {
        Self {
            insight_event: ApiInsightEvent::from(s.1),
        }
    }
}
