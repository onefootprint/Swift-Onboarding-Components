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
            | Self::Kyc(KycState::DataCollection)
            | Self::Kyb(KybState::DataCollection)
            | Self::Kyb(KybState::DocCollection)
            | Self::AlpacaKyc(AlpacaKycState::DocCollection)
            | Self::AlpacaKyc(AlpacaKycState::DataCollection)
            | Self::Document(DocumentState::DataCollection) => {
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
            | Self::Kyb(KybState::Complete)
            | Self::AdhocVendorCall(AdhocVendorCallState::VendorCalls)
            | Self::AdhocVendorCall(AdhocVendorCallState::Complete) => vec![],
        }
    }

    pub fn is_step_up(&self) -> bool {
        match self {
            Self::Kyc(KycState::DocCollection)
            | Self::Kyb(KybState::DocCollection)
            | Self::AlpacaKyc(AlpacaKycState::DocCollection) => true,
            Self::Kyc(KycState::DataCollection)
            | Self::Kyc(KycState::Complete)
            | Self::Kyc(KycState::Decisioning)
            | Self::Kyc(KycState::VendorCalls)
            | Self::AlpacaKyc(AlpacaKycState::DataCollection)
            | Self::AlpacaKyc(AlpacaKycState::Complete)
            | Self::AlpacaKyc(AlpacaKycState::Decisioning)
            | Self::AlpacaKyc(AlpacaKycState::PendingReview)
            | Self::AlpacaKyc(AlpacaKycState::VendorCalls)
            | Self::AlpacaKyc(AlpacaKycState::WatchlistCheck)
            | Self::Document(DocumentState::DataCollection)
            | Self::Document(DocumentState::Complete)
            | Self::Document(DocumentState::Decisioning)
            | Self::Kyb(KybState::DataCollection)
            | Self::Kyb(KybState::AwaitingAsyncVendors)
            | Self::Kyb(KybState::AwaitingBoKyc)
            | Self::Kyb(KybState::VendorCalls)
            | Self::Kyb(KybState::Decisioning)
            | Self::Kyb(KybState::StepUpDecisioning)
            | Self::AdhocVendorCall(AdhocVendorCallState::VendorCalls)
            | Self::AdhocVendorCall(AdhocVendorCallState::Complete)
            | Self::Kyb(KybState::Complete) => false,
        }
    }

    pub fn requires_user_input(&self) -> bool {
        !self.allowed_guards().is_empty()
    }
}
