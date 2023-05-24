pub struct Authorize;
pub struct MakeVendorCalls;
pub struct MakeDecision;
pub struct MakeWatchlistCheckCall; // OFAC, PEP, Adverse Media
pub struct ReviewCompleted;
pub struct DocCollected;

pub enum WorkflowActions {
    Authorize(Authorize),
    MakeVendorCalls(MakeVendorCalls),
    MakeDecision(MakeDecision),
    MakeWatchlistCheckCall(MakeWatchlistCheckCall),
    ReviewCompleted(ReviewCompleted),
    DocCollected(DocCollected),
}
