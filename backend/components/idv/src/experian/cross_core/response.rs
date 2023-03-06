use newtypes::experian::{Decision, DecisionSource, ResponseCode};

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
    #[serde(rename(deserialize = "tenantID"))]
    pub tenant_id: Option<String>,
    pub request_type: Option<String>,
    pub client_reference_id: Option<String>,
    pub exp_request_id: Option<String>,
    pub message_time: Option<String>,
    pub overall_response: OverallResponse,
    pub response_code: Option<ResponseCode>,
    pub response_type: Option<String>,
    pub response_message: Option<String>,
    pub category: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OverallResponse {
    pub decision: Option<Decision>,
    pub score: Option<i32>,
    // unfortunately no enum values listed
    pub decision_text: Option<String>,
    // unfortunately no enum values listed
    pub decision_reasons: Option<Vec<String>>,
    // unfortunately no enum values listed
    pub recommended_next_actions: Option<Vec<String>>,
    // idk what this is
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
    pub decision_source: Option<DecisionSource>,
    // Decision from service.
    pub decision: Option<Decision>,
    // List of reasons for decision
    pub decision_reasons: Option<Vec<String>>,
    pub score: Option<i32>,
    // Informational decision text
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
    pub warnings_errors: Option<Vec<WarningError>>,
    pub other_data: Option<OtherData>,
    // TODO: this is a monster enum/parsing thing with levels of fuzziness
    pub matches: Option<Vec<MatchData>>,
    pub decisions: Option<Vec<DecisionElementDecision>>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchData {
    pub name: Option<String>,
    pub value: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DecisionElementDecision {
    // This is unlikely to be an enum - no indication we can use that.
    pub element: Option<String>,
    // This contains reason codes from across all the experian products, so will need to coalesce or have all reason codes in one enum (IEN, CrossCore, PreciseID etc)
    // See the test_fixture response for an example
    pub value: Option<String>,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WarningError {
    // TODO: reason codes
    pub response_type: Option<String>,
    pub response_code: Option<ResponseCode>,
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
    #[serde(rename(deserialize = "preciseIDServer"))]
    pub precise_id_server: Option<FraudSolutionResponseProductsPreciseID>,
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

// TODO: matches and fuzzy matching

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_fixtures::experian_cross_core_response;

    #[test]
    fn test_parses() {
        let r: CrossCoreAPIResponse = serde_json::from_value(experian_cross_core_response())
            .expect("could not parse experian cross core");

        assert!(r.response_header.tenant_id.is_some())
    }
}
