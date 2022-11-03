use newtypes::{OnboardingStatus, ReasonCode};
use std::str::FromStr;

// Given a raw response, deserialize
pub fn parse_response(value: serde_json::Value) -> Result<IDologyResponse, super::Error> {
    let response: IDologyResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

// TODO: haven't checked this works yet
pub type IdNumber = u64;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct IDologyResponse {
    pub response: IDologySuccess,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct IDologySuccess {
    pub qualifiers: Option<IDologyQualifiers>,
    // TODO should these be options?
    pub results: Option<KeyResponse>,
    pub summary_result: Option<KeyResponse>,
    pub id_number: Option<IdNumber>,
    pub id_scan: Option<String>,
}

impl IDologySuccess {
    /// IDology-determined status for verifying the customer
    pub fn status(&self) -> OnboardingStatus {
        match self.summary_result.as_ref().map(|x| x.key.as_str()) {
            Some("id.success") => OnboardingStatus::Verified,
            Some("id.failure") => OnboardingStatus::Failed,
            _ => OnboardingStatus::ManualReview,
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

#[derive(Debug, Clone, serde::Deserialize)]
pub struct IDologyQualifiers {
    pub qualifier: serde_json::Value,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct KeyResponse {
    pub key: String,
}

impl KeyResponse {
    fn parse_key(value: serde_json::Value) -> Option<String> {
        let response: Self = serde_json::value::from_value(value).ok()?;
        Some(response.key)
    }
}

impl IDologyQualifiers {
    fn parse_qualifiers(&self) -> Vec<ReasonCode> {
        // In the IDology API, the key named `qualifier` can either be a list of qualifiers OR
        // a single qualifier. Parse both cases here
        match self.qualifier {
            serde_json::Value::Object(_) => {
                if let Some(qualifier) = Self::parse_qualifier(self.qualifier.clone()) {
                    vec![qualifier]
                } else {
                    vec![]
                }
            }
            serde_json::Value::Array(ref qualifier_list) => qualifier_list
                .iter()
                .cloned()
                .flat_map(Self::parse_qualifier)
                .collect(),
            _ => vec![],
        }
    }

    fn parse_qualifier(qualifier: serde_json::Value) -> Option<ReasonCode> {
        let key = KeyResponse::parse_key(qualifier)?;
        ReasonCode::from_str(key.as_str()).ok()
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
