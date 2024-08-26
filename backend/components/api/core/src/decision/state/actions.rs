use newtypes::DataLifetimeSeqno;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use strum_macros::EnumDiscriminants;
use strum_macros::EnumString;

#[derive(Clone, Debug)]
pub struct Authorize {
    pub seqno: DataLifetimeSeqno,
}

#[derive(Clone, Debug)]
pub struct MakeVendorCalls {
    pub seqno: DataLifetimeSeqno,
}

#[derive(Clone, Debug)]
pub struct MakeDecision {
    pub seqno: DataLifetimeSeqno,
}

#[derive(Debug)]
pub struct MakeWatchlistCheckCall; // OFAC, PEP, Adverse Media
#[derive(Debug)]
pub struct DocCollected;
#[derive(Debug)]
pub struct BoKycCompleted;
#[derive(Debug)]
pub struct AsyncVendorCallsCompleted;

#[derive(EnumDiscriminants)]
#[strum_discriminants(
    name(WorkflowActionsKind),
    vis(pub),
    derive(EnumString, strum::Display, Apiv2Schema, DeserializeFromStr),
    strum(serialize_all = "snake_case")
)]
#[strum(serialize_all = "snake_case")]
pub enum WorkflowActions {
    Authorize(Authorize),
    MakeVendorCalls(MakeVendorCalls),
    MakeDecision(MakeDecision),
    MakeWatchlistCheckCall(MakeWatchlistCheckCall),
    DocCollected(DocCollected),
    BoKycCompleted(BoKycCompleted),
    AsyncVendorCallsCompleted(AsyncVendorCallsCompleted),
}

impl std::fmt::Debug for WorkflowActions {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        WorkflowActionsKind::from(self).fmt(f)
    }
}
