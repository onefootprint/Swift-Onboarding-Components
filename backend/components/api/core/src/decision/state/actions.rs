pub struct Authorize;
pub struct MakeVendorCalls;
pub struct MakeDecision;
pub struct MakeAdverseMediaCall;

pub enum WorkflowActions {
    Authorize(Authorize),
    MakeVendorCalls(MakeVendorCalls),
    MakeDecision(MakeDecision),
    MakeAdverseMediaCall(MakeAdverseMediaCall),
}
