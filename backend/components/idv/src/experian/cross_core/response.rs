/// This is the top level response from CrossCore
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CrossCoreAPIResponse {
    pub response_header: ResponseHeader,
    pub original_request_data: super::request::BodyPayload,
    pub client_response_payload: ClientResponsePayload,
}
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseHeader {
    // TODO: fix i_d
    pub tenant_i_d: Option<String>,
    pub request_type: Option<String>,
    pub client_reference_id: Option<String>,
    pub exp_request_id: Option<String>,
    pub message_time: Option<String>,
    pub overall_response: OverallResponse,
    pub response_code: Option<String>,
    pub response_type: Option<String>,
    pub response_message: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OverallResponse {
    // TODO: enum
    pub decision: Option<String>,
    pub score: Option<i32>,
    // TODO: enum
    pub decision_text: Option<String>,
    // TODO: enum
    pub decision_reasons: Option<Vec<String>>,
    // TODO: enum
    pub recommended_next_actions: Option<Vec<String>>,
    pub spare_objects: Option<Vec<String>>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientResponsePayload {
    pub orchestration_decisions: Vec<OrchestrationStepDecision>,
    pub decision_elements: Vec<DecisionElement>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationStepDecision {
    // Sequence/point in workflow that decision point was generated.
    pub sequence_id: Option<String>,
    // Name of service for the decision. Values can be:
    // FraudNet
    // Hunter
    // PreciseID
    // ProveID
    // TODO: enum
    pub decision_source: Option<String>,
    // Decision from service. Value:
    // Can be defined in individual strategy, but example values are: ACCEPT, REFER, NODECISION, STOP, REJECT.
    // TODO: enum
    pub decision: Option<String>,
    // List of reasons for decision
    pub decision_reasons: Option<Vec<String>>,
    pub score: Option<i32>,
    // Informational decision text
    // TODO: enum
    pub decision_text: Option<String>,
    // Next action recommended from the fraud engine
    pub next_action: Option<String>,
    // Reference from backing application
    pub app_reference: Option<String>,
    // Time of decision. FORMAT: YYYY-MM-DDTHH:MM:SSZ
    // TODO: parse?
    pub decision_time: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DecisionElement {
    pub service_name: Option<String>,
    pub applicant_id: Option<String>,
    pub normalized_score: Option<i32>,
    pub warnings_errors: Vec<WarningError>,
    pub other_data: OtherData,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WarningError {
    // TODO: enum
    pub response_type: Option<String>,
    // TODO: enum
    pub response_code: Option<String>,
    // TODO: enum
    pub response_message: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OtherData {
    pub json: Option<JsonOtherData>,
}
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonOtherData {
    pub fraud_solutions: Option<FraudSolutions>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutions {
    pub response: Option<FraudSolutionResponse>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutionResponse {
    pub products: Option<FraudSolutionResponseProducts>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutionResponseProducts {
    // TODO: fix i_d
    pub precise_i_d_server: Option<FraudSolutionResponseProductsPreciseID>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutionResponseProductsPreciseID {
    pub error: Option<FraudSolutionResponseProductsError>,
    pub pidxmlversion: Option<String>,
}
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutionResponseProductsError {
    pub report_date: Option<String>,
    pub report_time: Option<String>,
    pub error_code: Option<String>,
    pub error_description: Option<String>,
    pub action_indicator: Option<ActionIndicator>,
    pub reference_number: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActionIndicator {
    pub value: Option<String>,
    pub code: Option<String>,
}
