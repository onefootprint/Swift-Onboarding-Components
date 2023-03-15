use crate::experian::{
    error::{CrossCoreResponseError, Error},
    precise_id::response::PreciseIDAPIResponse,
};

pub fn parse_response(response: serde_json::Value) -> Result<CrossCoreAPIResponse, Error> {
    let r: CrossCoreAPIResponse = serde_json::from_value(response)?;

    Ok(r)
}

/// This is the top level response from CrossCore
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CrossCoreAPIResponse {
    pub response_header: ResponseHeader,
    pub original_request_data: super::request::BodyPayload,
    pub client_response_payload: ClientResponsePayload,
}

impl CrossCoreAPIResponse {
    // Helper to dig down to the precise id response from cross core wrapper
    #[allow(dead_code)]
    pub fn precise_id_response(&self) -> Result<PreciseIDAPIResponse, Error> {
        let response = self
            .client_response_payload
            .decision_elements
            .iter()
            .find(|de| {
                de.service_name
                    .as_ref()
                    .map(|n| n == "PreciseId")
                    .unwrap_or(false)
            })
            .ok_or(CrossCoreResponseError::PreciseIDResponseNotFound)?
            .clone()
            .other_data
            .and_then(|o| o.json)
            .and_then(|j| j.fraud_solutions)
            .and_then(|j| j.response)
            .and_then(|r| r.products)
            .and_then(|p| p.precise_id_server);

        if let Some(r) = response {
            Ok(r)
        } else {
            Err(Error::MissingPreciseIDResponse)
        }
    }
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseHeader {
    #[serde(rename(deserialize = "tenantID"))]
    pub tenant_id: Option<String>,
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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OverallResponse {
    pub decision: Option<String>,
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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientResponsePayload {
    pub orchestration_decisions: Vec<OrchestrationStepDecision>,
    pub decision_elements: Vec<DecisionElement>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationStepDecision {
    // Sequence/point in workflow that decision point was generated.
    pub sequence_id: Option<String>,
    pub decision_source: Option<String>,
    // Decision from service.
    pub decision: Option<String>,
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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecisionElement {
    pub service_name: Option<String>,
    pub applicant_id: Option<String>,
    pub normalized_score: Option<i32>,
    pub warnings_errors: Option<Vec<WarningError>>,
    pub other_data: Option<OtherData>,
    pub matches: Option<serde_json::Value>,
    pub decisions: Option<Vec<DecisionElementDecision>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecisionElementDecision {
    // This is unlikely to be an enum - no indication we can use that.
    pub element: Option<String>,
    // This contains reason codes from across all the experian products, so will need to coalesce or have all reason codes in one enum (IEN, CrossCore, PreciseID etc)
    // See the test_fixture response for an example
    pub value: Option<String>,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WarningError {
    pub response_type: Option<String>,
    pub response_code: Option<String>,
    pub response_message: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OtherData {
    pub json: Option<JsonOtherData>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonOtherData {
    pub fraud_solutions: Option<FraudSolutions>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutions {
    pub response: Option<FraudSolutionResponse>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutionResponse {
    pub products: Option<FraudSolutionResponseProducts>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FraudSolutionResponseProducts {
    #[serde(rename(deserialize = "preciseIDServer"))]
    pub precise_id_server: Option<PreciseIDAPIResponse>,
    // This is data from the Identity Element Network (IEN). This data is returned separately, but also
    // rolls up into the preciseID score and response
    pub customer_management: Option<serde_json::Value>,
    // we'd add syntheticID etc here
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

        assert!(r
            .precise_id_response()
            .unwrap()
            .summary
            .unwrap()
            .scores
            .unwrap()
            .precise_id_score
            .is_some());
    }
}
