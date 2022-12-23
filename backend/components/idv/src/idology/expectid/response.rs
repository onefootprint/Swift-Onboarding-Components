use crate::idology::{
    error as IdologyError,
    response_common::{IDologyQualifiers, KeyResponse},
};
use newtypes::{DecisionStatus, ReasonCode};

// Given a raw response, deserialize
pub fn parse_response(value: serde_json::Value) -> Result<ExpectIDAPIResponse, IdologyError::Error> {
    let response: ExpectIDAPIResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

// TODO: haven't checked this works yet
pub type IdNumber = u64;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ExpectIDAPIResponse {
    pub response: ExpectIDResponse,
}
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct ExpectIDResponse {
    pub qualifiers: Option<IDologyQualifiers>,
    // TODO should these be options?
    pub results: Option<KeyResponse>,
    pub summary_result: Option<KeyResponse>,
    pub id_number: Option<IdNumber>,
    pub id_scan: Option<String>,
}

type CreateManualReview = bool;

impl ExpectIDResponse {
    /// IDology-determined status for verifying the customer
    pub fn status(&self) -> (DecisionStatus, CreateManualReview) {
        match self.summary_result.as_ref().map(|x| x.key.as_str()) {
            Some("id.success") => (DecisionStatus::Pass, false),
            Some("id.failure") => (DecisionStatus::Fail, false),
            _ => (DecisionStatus::Fail, true),
        }
    }

    /// Whether the ID was located on IDology
    pub fn id_located(&self) -> bool {
        if let Some(ref results) = self.results {
            results.key.as_str() == "result.match"
        } else {
            false
        }
    }

    /// Whether IDology tells us that we need to upload an ID scan
    pub fn is_id_scan_required(&self) -> bool {
        match self.id_scan {
            Some(ref id_scan) => id_scan.as_str() == "yes",
            None => false,
        }
    }

    pub fn parse_qualifiers(&self) -> Vec<ReasonCode> {
        if let Some(ref qualifiers) = self.qualifiers {
            qualifiers.parse_qualifiers()
        } else {
            vec![]
        }
    }
}

#[cfg(test)]
mod tests {
    use newtypes::IDologyReasonCode;
    use serde_json::json;

    use super::*;

    #[test]
    fn test_idology_response_single() {
        let response = json!({
            "response": {
              "id-number": 3010453,
              "summary-result": {
                "key": "id.success",
                "message": "Pass"
              },
              "results": {
                "key": "result.match",
                "message": "ID Located"
              },
              "qualifiers": {
                "qualifier": {
                  "key": "resultcode.ip.not.located",
                  "message": "IP Not Located"
                }
              }
            }
          }
        );
        let response = parse_response(response).expect("Could not parse response");
        let reason_codes = response.response.qualifiers.unwrap().parse_qualifiers();
        assert_eq!(
            reason_codes,
            vec![ReasonCode::IDology(IDologyReasonCode::IpNotLocated)],
        )
    }

    #[test]
    fn test_idology_response_list() {
        let response = crate::test_fixtures::test_idology_expectid_response();
        let response = parse_response(response).expect("Could not parse response");
        let reason_codes = response.response.qualifiers.unwrap().parse_qualifiers();
        let expected = vec![
            ReasonCode::IDology(IDologyReasonCode::IpNotLocated),
            ReasonCode::IDology(IDologyReasonCode::StreetNameDoesNotMatch),
        ];
        assert_eq!(reason_codes, expected);
    }

    #[test]
    fn test_idology_response_invalid() {
        let response = json!({
            "response": {
              "qualifiers": {
                "qualifier": "invalid",
              }
            }
          }
        );
        let response = parse_response(response).expect("Could not parse response");
        assert_eq!(response.response.qualifiers.unwrap().parse_qualifiers().len(), 0);
        assert!(response.response.results.is_none());
        assert!(response.response.summary_result.is_none());
    }

    #[test]
    fn test_idology_response_no_data() {
        let response = json!({
            "response": {
                "id-number": 2972309,
            }
        });
        let response = parse_response(response).expect("Could not parse response");
        assert!(response.response.qualifiers.is_none());
        assert!(response.response.results.is_none());
        assert!(response.response.summary_result.is_none());
    }
}
