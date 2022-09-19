use db::models::{insight_event::InsightEvent, webauthn_credential::WebauthnCredential};
use paperclip::actix::Apiv2Schema;

use super::insight_event::FpInsightEvent;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct FpLiveness {
    pub insight_event: FpInsightEvent,
}

impl From<(WebauthnCredential, InsightEvent)> for FpLiveness {
    fn from(s: (WebauthnCredential, InsightEvent)) -> Self {
        Self {
            insight_event: FpInsightEvent::from(s.1),
        }
    }
}
