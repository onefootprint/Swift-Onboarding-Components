use crate::idology::{
    error as IdologyError,
    response_common::{IDologyQualifiers, IdologyResponseHelpers, KeyResponse},
    IdologyError::RequestError,
};
use itertools::Itertools;
use newtypes::{DecisionStatus, IDologyReasonCode};
use serde::{Deserialize, Deserializer};

// Given a raw response, deserialize
pub fn parse_response(value: serde_json::Value) -> Result<ExpectIDAPIResponse, IdologyError::Error> {
    let response: ExpectIDAPIResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

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
    pub error: Option<String>,
    // If the customer's name is located on any of the Patriot Act watchlists (or on THE OFAC list only, if that option is set in the IDCenter),
    // then the ExpectID PA response will be enclosed in the <restriction> tag,
    pub restriction: Option<Restriction>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct Restriction {
    pub key: Option<String>,
    pub message: Option<String>,
    pub pa: Option<serde_json::Value>,
}

impl Restriction {
    pub fn parse_pa(&self) -> Option<Vec<Pa>> {
        self.pa.as_ref().map(|pa| match pa {
            serde_json::Value::Object(_) => {
                let parsed_pa: Option<Pa> = serde_json::value::from_value(pa.to_owned()).ok();
                match parsed_pa {
                    Some(p) => vec![p],
                    None => vec![],
                }
            }
            serde_json::Value::Array(ref list) => list
                .iter()
                .cloned()
                .flat_map(|i| serde_json::value::from_value(i).ok())
                .collect(),
            _ => vec![],
        })
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum PaList {
    OFAC,
    OtherWatchlist,
}

#[derive(Debug, Clone, serde::Deserialize, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub struct Pa {
    pub list: String,
    // shown in docs as String, proofing against the possibility a response gives us int
    #[serde(deserialize_with = "from_string_or_int")]
    pub score: Option<String>,
    pub record_type: Option<String>,
    pub dob: Option<String>,
}

// TODO: unsure the enum here
impl Pa {
    fn to_watchlist_enum(&self) -> PaList {
        match self.list.as_str() {
            "Office of Foreign Asset Control" => PaList::OFAC,
            "OFAC SDN" => PaList::OFAC,
            _ => PaList::OtherWatchlist,
        }
    }
}

type CreateManualReview = bool;

impl ExpectIDResponse {
    /// IDology-determined status for verifying the customer
    pub fn summary_status(&self) -> (DecisionStatus, CreateManualReview) {
        match self.summary_result.as_ref().map(|x| x.key.as_str()) {
            Some("id.success") => (DecisionStatus::Pass, false),
            Some("id.failure") => (DecisionStatus::Fail, false),
            _ => (DecisionStatus::Fail, true),
        }
    }

    pub fn status(&self) -> (DecisionStatus, CreateManualReview) {
        match self.id_located() {
            true => (DecisionStatus::Pass, false),
            false => (DecisionStatus::Fail, false),
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

    pub fn parse_qualifiers(&self) -> Vec<IDologyReasonCode> {
        if let Some(ref qualifiers) = self.qualifiers {
            qualifiers.parse_qualifiers()
        } else {
            vec![]
        }
    }

    pub fn raw_qualifiers(&self) -> Vec<String> {
        if let Some(ref qualifiers) = self.qualifiers {
            qualifiers.raw_qualifiers()
        } else {
            vec![]
        }
    }

    // TODO: specialized review perhaps?
    pub fn watchlists(&self) -> Option<Vec<PaList>> {
        self.restriction.as_ref().map(|r| {
            let mut lists: Vec<PaList> = vec![];
            let key = r.key.as_ref();
            let is_global_wl = key.map(|k| k.starts_with("global")).unwrap_or(false);

            if let Some(pa_lists) = r.parse_pa() {
                pa_lists
                    .iter()
                    .map(|l| l.to_watchlist_enum())
                    .for_each(|l| lists.push(l))
            };

            if lists.is_empty() && is_global_wl {
                lists.push(PaList::OtherWatchlist);
            }

            lists.into_iter().unique().collect()
        })
    }

    pub fn has_potential_watchlist_hit(&self) -> bool {
        self.watchlists().map(|w| !w.is_empty()).unwrap_or(false)
    }

    fn error(&self) -> Option<RequestError> {
        self.error
            .clone()
            .map(IdologyResponseHelpers::parse_idology_error)
    }

    pub fn validate(&self) -> Result<(), IdologyError::Error> {
        // see if we have any errors
        if let Some(error) = self.error() {
            return Err(error.into());
        }

        Ok(())
    }
}

fn from_string_or_int<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
where
    D: Deserializer<'de>,
{
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum StringOrI32 {
        Str(String),
        Int(i32),
    }

    Ok(
        Option::<StringOrI32>::deserialize(deserializer)?.map(|v| match v {
            StringOrI32::Str(s) => s,
            StringOrI32::Int(i) => format!("{}", i),
        }),
    )
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
        assert_eq!(reason_codes, vec![IDologyReasonCode::IpNotLocated],)
    }

    #[test]
    fn test_idology_response_list() {
        let response = crate::test_fixtures::test_idology_expectid_response();
        let response = parse_response(response).expect("Could not parse response");
        let reason_codes = response.response.qualifiers.unwrap().parse_qualifiers();
        let expected = vec![
            IDologyReasonCode::IpNotLocated,
            IDologyReasonCode::StreetNameDoesNotMatch,
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
        assert!(response.response.watchlists().is_none())
    }

    #[test]
    fn test_parse_pa() {
        let raw_single = json!({"response": {
            "id-number": 3010453,
            "restriction": {
              "key": "global.watch.list",
              "message": "you are bad",
              "pa": {
                  "list": "Office of Foreign Asset Control",
                  "score": "97",
                  "dob": "02121978"
                }
            },
        }});

        let raw_multiple = json!({"response": {
            "id-number": 3010453,
            "restriction": {
              "key": "global.watch.list",
              "message": "you are bad",
              "pa": [
                {
                  "list": "Office of Foreign Asset Control",
                  // int instead of string
                  "score": 98
                },
                {
                    "list": "Bad Boy list",
                    "score": "97",
                },
                ]
            },
        }});

        let raw_missing_pa = json!({"response": {
            "id-number": 3010453,
            "restriction": {
              "key": "global.watch.list",
              "message": "you are bad",
            }
        }});

        let raw_malformed_pa = json!({"response": {
            "id-number": 3010453,
            "restriction": {
              "key": "global.watch.list",
              "message": "you are bad",
              "pa": {
                "mistake": "97",
              }
            }
        }});

        let pa_single = parse_response(raw_single)
            .expect("Could not parse response")
            .response
            .watchlists()
            .unwrap();
        let pa_multiple = parse_response(raw_multiple)
            .expect("Could not parse response")
            .response
            .watchlists()
            .unwrap();
        let pa_missing_pa = parse_response(raw_missing_pa)
            .expect("Could not parse response")
            .response
            .watchlists()
            .unwrap();
        let pa_malformed = parse_response(raw_malformed_pa)
            .expect("Could not parse response")
            .response
            .watchlists()
            .unwrap();

        assert_eq!(vec![PaList::OFAC], pa_single);
        assert_eq!(vec![PaList::OFAC, PaList::OtherWatchlist], pa_multiple);
        assert_eq!(vec![PaList::OtherWatchlist], pa_missing_pa);
        assert_eq!(vec![PaList::OtherWatchlist], pa_malformed);
    }
}
