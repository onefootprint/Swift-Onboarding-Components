use crate::{export_schema, Apiv2Schema, JsonSchema, Serialize};
use newtypes::{FootprintReasonCode, WatchlistCheckId, WatchlistCheckStatusKind};

#[derive(Debug, Clone, Serialize, JsonSchema, Apiv2Schema)]
pub struct WatchlistCheck {
    pub id: WatchlistCheckId,
    pub status: WatchlistCheckStatusKind,
    pub reason_codes: Option<Vec<FootprintReasonCode>>,
}

export_schema!(WatchlistCheck);
