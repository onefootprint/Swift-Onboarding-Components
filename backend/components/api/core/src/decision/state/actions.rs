use super::StateError;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use strum_macros::{
    EnumDiscriminants,
    EnumString,
};

#[derive(Debug)]
pub struct Authorize;
#[derive(Debug)]
pub struct MakeVendorCalls;
#[derive(Debug)]
pub struct MakeDecision;
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

impl TryFrom<WorkflowActionsKind> for WorkflowActions {
    type Error = StateError;

    fn try_from(value: WorkflowActionsKind) -> Result<Self, Self::Error> {
        match value {
            WorkflowActionsKind::Authorize => Ok(Self::Authorize(Authorize {})),
            WorkflowActionsKind::MakeVendorCalls => Ok(Self::MakeVendorCalls(MakeVendorCalls {})),
            WorkflowActionsKind::MakeDecision => Ok(Self::MakeDecision(MakeDecision {})),
            WorkflowActionsKind::MakeWatchlistCheckCall => {
                Ok(Self::MakeWatchlistCheckCall(MakeWatchlistCheckCall {}))
            }
            WorkflowActionsKind::DocCollected => Ok(Self::DocCollected(DocCollected {})),
            WorkflowActionsKind::BoKycCompleted => Ok(Self::BoKycCompleted(BoKycCompleted {})),
            WorkflowActionsKind::AsyncVendorCallsCompleted => {
                Ok(Self::AsyncVendorCallsCompleted(AsyncVendorCallsCompleted {}))
            }
        }
    }
}
