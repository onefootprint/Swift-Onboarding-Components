use crate::auth::tenant::AuthActor;
use api_wire_types::DecisionRequest;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use strum_macros::EnumDiscriminants;
use strum_macros::EnumString;

use super::StateError;

pub struct Authorize;
pub struct MakeVendorCalls;
pub struct MakeDecision;
pub struct MakeWatchlistCheckCall; // OFAC, PEP, Adverse Media
pub struct ReviewCompleted {
    pub decision: DecisionRequest,
    pub actor: AuthActor,
}
pub struct DocCollected;

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
    ReviewCompleted(ReviewCompleted),
    DocCollected(DocCollected),
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
            WorkflowActionsKind::ReviewCompleted => Err(StateError::WorkflowActionsConversionError(
                WorkflowActionsKind::ReviewCompleted,
            )),
            WorkflowActionsKind::DocCollected => Ok(Self::DocCollected(DocCollected {})),
        }
    }
}
