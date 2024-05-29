use crate::{
    Apiv2Schema,
    Serialize,
};
use newtypes::{
    FootprintReasonCode,
    WatchlistCheckId,
    WatchlistCheckStatusKind,
};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct WatchlistCheck {
    pub id: WatchlistCheckId,
    pub status: WatchlistCheckStatusKind,
    pub reason_codes: Option<Vec<FootprintReasonCode>>,
}
