use api_wire_types::DecisionRequest;

use crate::auth::tenant::AuthActor;

pub struct Authorize;
pub struct MakeVendorCalls;
pub struct MakeDecision;
pub struct MakeWatchlistCheckCall; // OFAC, PEP, Adverse Media
pub struct ReviewCompleted {
    pub decision: DecisionRequest,
    pub actor: AuthActor,
}
pub struct DocCollected;

pub enum WorkflowActions {
    Authorize(Authorize),
    MakeVendorCalls(MakeVendorCalls),
    MakeDecision(MakeDecision),
    MakeWatchlistCheckCall(MakeWatchlistCheckCall),
    ReviewCompleted(ReviewCompleted),
    DocCollected(DocCollected),
}
