pub use super::*;

/// Represents types of actions that are "guardable" by enforcing that an active workflow is in a
/// certain state.
#[derive(Debug, Clone, Copy, Eq, PartialEq, strum_macros::Display)]
#[strum(serialize_all = "snake_case")]
pub enum WorkflowGuard {
    AddData,
    AddDocument,
}

impl WorkflowState {
    pub fn allowed_guards(&self) -> Vec<WorkflowGuard> {
        match self {
            Self::Kyc(KycState::DocCollection)
            | Self::AlpacaKyc(AlpacaKycState::DocCollection)
            | Self::Kyc(KycState::DataCollection)
            | Self::Kyb(KybState::DataCollection)
            | Self::Kyb(KybState::DocCollection)
            | Self::AlpacaKyc(AlpacaKycState::DataCollection) => {
                vec![WorkflowGuard::AddData, WorkflowGuard::AddDocument]
            }
            Self::Document(DocumentState::DataCollection) => {
                // Needed to upload the barcode
                vec![WorkflowGuard::AddData, WorkflowGuard::AddDocument]
            }
            Self::Kyc(KycState::Complete)
            | Self::Kyc(KycState::Decisioning)
            | Self::Kyc(KycState::VendorCalls)
            | Self::AlpacaKyc(AlpacaKycState::Complete)
            | Self::AlpacaKyc(AlpacaKycState::Decisioning)
            | Self::AlpacaKyc(AlpacaKycState::PendingReview)
            | Self::AlpacaKyc(AlpacaKycState::VendorCalls)
            | Self::AlpacaKyc(AlpacaKycState::WatchlistCheck)
            | Self::Document(DocumentState::Complete)
            | Self::Document(DocumentState::Decisioning)
            | Self::Kyb(KybState::AwaitingAsyncVendors)
            | Self::Kyb(KybState::AwaitingBoKyc)
            | Self::Kyb(KybState::VendorCalls)
            | Self::Kyb(KybState::Decisioning)
            | Self::Kyb(KybState::StepUpDecisioning)
            | Self::Kyb(KybState::Complete) => vec![],
        }
    }

    pub fn requires_user_input(&self) -> bool {
        // TODO could one day represent this with guards too
        match self {
            Self::Kyc(KycState::DataCollection)
            | Self::Kyc(KycState::DocCollection)
            | Self::Kyb(KybState::DocCollection)
            | Self::AlpacaKyc(AlpacaKycState::DataCollection)
            | Self::AlpacaKyc(AlpacaKycState::DocCollection)
            | Self::Document(DocumentState::DataCollection)
            | Self::Kyb(KybState::DataCollection) => true,
            Self::Kyc(KycState::Complete)
            | Self::Kyc(KycState::Decisioning)
            | Self::Kyc(KycState::VendorCalls)
            | Self::AlpacaKyc(AlpacaKycState::Complete)
            | Self::AlpacaKyc(AlpacaKycState::Decisioning)
            | Self::AlpacaKyc(AlpacaKycState::PendingReview)
            | Self::AlpacaKyc(AlpacaKycState::VendorCalls)
            | Self::AlpacaKyc(AlpacaKycState::WatchlistCheck)
            | Self::Document(DocumentState::Complete)
            | Self::Document(DocumentState::Decisioning)
            | Self::Kyb(KybState::AwaitingBoKyc)
            | Self::Kyb(KybState::VendorCalls)
            | Self::Kyb(KybState::AwaitingAsyncVendors)
            | Self::Kyb(KybState::Decisioning)
            | Self::Kyb(KybState::StepUpDecisioning)
            | Self::Kyb(KybState::Complete) => false,
        }
    }
}
