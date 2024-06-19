use crate::{
    Apiv2Response,
    Serialize,
};
use newtypes::{
    FootprintReasonCode,
    WatchlistCheckId,
    WatchlistCheckStatusKind,
};

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct WatchlistCheck {
    pub id: WatchlistCheckId,
    pub status: WatchlistCheckStatusKind,
    pub reason_codes: Option<Vec<FootprintReasonCode>>,
}
