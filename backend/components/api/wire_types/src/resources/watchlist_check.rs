use crate::Apiv2Response;
use crate::Serialize;
use newtypes::FootprintReasonCode;
use newtypes::WatchlistCheckId;
use newtypes::WatchlistCheckStatusKind;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct WatchlistCheck {
    pub id: WatchlistCheckId,
    pub status: WatchlistCheckStatusKind,
    pub reason_codes: Option<Vec<FootprintReasonCode>>,
}
