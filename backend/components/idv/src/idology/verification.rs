use newtypes::ReasonCode;
use std::str::FromStr;

pub fn parse(value: serde_json::Value) -> Result<Vec<ReasonCode>, super::Error> {
    let response: IDologyResponse = serde_json::value::from_value(value)?;
    let results = response.response.qualifiers.parse_qualifiers();
    Ok(results)
}

#[derive(Debug, serde::Deserialize)]
struct IDologyResponse {
    response: IDologySuccess,
}

#[derive(Debug, serde::Deserialize)]
struct IDologySuccess {
    qualifiers: IDologyQualifiers,
}

#[derive(Debug, serde::Deserialize)]
struct IDologyQualifiers {
    qualifier: serde_json::Value,
}

impl IDologyQualifiers {
    fn parse_qualifiers(&self) -> Vec<ReasonCode> {
        // In the IDology API, the key named `qualifier` can either be a list of qualifiers OR
        // a single qualifier. Parse both cases here
        match self.qualifier {
            serde_json::Value::Object(ref qualifier) => {
                if let Some(qualifier) = Self::parse_qualifier(qualifier) {
                    vec![qualifier]
                } else {
                    vec![]
                }
            }
            serde_json::Value::Array(ref qualifier_list) => qualifier_list
                .iter()
                .filter_map(|x| x.as_object())
                .flat_map(Self::parse_qualifier)
                .collect(),
            _ => vec![],
        }
    }

    fn parse_qualifier(qualifier: &serde_json::Map<String, serde_json::Value>) -> Option<ReasonCode> {
        let key_value = qualifier.get("key")?;
        let key_str = key_value.as_str()?;
        ReasonCode::from_str(key_str).ok()
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
              "id-number": "3010453",
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
        let reason_codes = parse(response).expect("Could not parse response");
        assert_eq!(
            reason_codes,
            vec![ReasonCode::IDology(IDologyReasonCode::IpNotLocated)],
        )
    }

    #[test]
    fn test_idology_response_list() {
        let response = json!({
            "response": {
              "id-number": "3010453",
              "summary-result": {
                "key": "id.success",
                "message": "Pass"
              },
              "results": {
                "key": "result.match",
                "message": "ID Located"
              },
              "qualifiers": {
                "qualifier": [
                  {
                    "key": "resultcode.ip.not.located",
                    "message": "IP Not Located"
                  },
                  {
                    "key": "resultcode.street.name.does.not.match",
                    "message": "Street name does not match"
                  },
                ]
              }
            }
          }
        );
        let reason_codes = parse(response).expect("Could not parse response");
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
        let reason_codes = parse(response).expect("Could not parse response");
        assert_eq!(reason_codes, vec![]);
    }
}
