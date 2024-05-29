use super::*;
use std::str::FromStr;
use test_case::test_case;

#[test_case(WorkflowState::Kyc(KycState::DataCollection) => "kyc.data_collection")]
fn test_to_string(s: WorkflowState) -> String {
    s.to_string()
}

#[test_case("kyc.decisioning" => WorkflowState::Kyc(KycState::Decisioning))]
fn test_from_str(input: &str) -> WorkflowState {
    WorkflowState::from_str(input).unwrap()
}
