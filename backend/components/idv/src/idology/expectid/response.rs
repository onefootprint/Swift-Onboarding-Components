use crate::idology::common::response::from_string_or_int;
use crate::idology::common::response::IDologyQualifiers;
use crate::idology::common::response::IdologyResponseHelpers;
use crate::idology::common::response::KeyResponse;
use crate::idology::error as IdologyError;
use crate::idology::IdologyError::RequestError;
use newtypes::DecisionStatus;
use newtypes::FootprintReasonCode;
use std::collections::HashSet;

// Given a raw response, deserialize
pub fn parse_response(value: serde_json::Value) -> Result<ExpectIDResponse, IdologyError::Error> {
    let response: ExpectIDResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

pub type IdNumber = u64;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ExpectIDResponse {
    pub response: Response,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub struct Response {
    pub qualifiers: Option<IDologyQualifiers>,
    // TODO should these be options?
    pub results: Option<KeyResponse>,
    pub summary_result: Option<KeyResponse>,
    pub id_number: Option<IdNumber>,
    pub id_scan: Option<String>,
    pub error: Option<String>,
    // If the customer's name is located on any of the Patriot Act watchlists (or on THE OFAC list only, if
    // that option is set in the IDCenter), then the ExpectID PA response will be enclosed in the
    // <restriction> tag,
    pub restriction: Option<Restriction>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, PartialEq, Eq, Default)]
#[serde(rename_all = "kebab-case")]
pub struct Restriction {
    pub key: Option<String>,
    pub message: Option<String>,
    pub pa: Option<serde_json::Value>,
}

impl Restriction {
    fn parse_pa(&self) -> Option<Vec<Pa>> {
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

    pub fn watchlists(&self) -> Vec<PaWatchlistHit> {
        let is_watchlist_hit = self
            .key
            .as_ref()
            .map(|k| k == "global.watch.list")
            .unwrap_or(false);

        let hits = if let Some(l) = self.parse_pa() {
            l.into_iter()
                .map(PaWatchlistHit::try_from)
                .filter_map(|r| match r {
                    Ok(h) => Some(h),
                    Err(err) => {
                        tracing::error!(?err, "Error parsing Idology watchlist hit");
                        None
                    }
                })
                .collect()
        } else {
            vec![]
        };

        if (is_watchlist_hit && hits.is_empty()) || (!is_watchlist_hit && !hits.is_empty()) {
            tracing::error!(is_watchlist_hit=%is_watchlist_hit, hits=format!("{:?}", hits), "Unexpected Idology watchlist response");
        }

        hits
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum PaList {
    OFAC,
    PEP,
    NonSDNList,
}

#[derive(Debug, Clone, serde::Deserialize, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub struct Pa {
    pub list: String,
    // shown in docs as String, proofing against the possibility a response gives us int
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    pub score: Option<String>,
    pub record_type: Option<String>,
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    pub dob: Option<String>,
}

// Parsed Pa
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PaWatchlistHit {
    list: PaList,
    score: i32,
    dob: Option<String>,
    record_type: Option<String>,
}

impl From<PaWatchlistHit> for FootprintReasonCode {
    fn from(h: PaWatchlistHit) -> Self {
        match h.list {
            PaList::OFAC => FootprintReasonCode::WatchlistHitOfac,
            PaList::PEP => FootprintReasonCode::WatchlistHitPep,
            PaList::NonSDNList => FootprintReasonCode::WatchlistHitNonSdn,
        }
    }
}

impl PaWatchlistHit {
    pub fn to_footprint_reason_codes(hits: Vec<PaWatchlistHit>) -> Vec<FootprintReasonCode> {
        let codes: HashSet<FootprintReasonCode> = hits
            .into_iter()
            .filter(|h| h.score > 93)
            .map(|h| h.into())
            .collect();
        codes.into_iter().collect()
    }
}

#[derive(Debug, thiserror::Error)]
pub enum PaWatchlistHitParseError {
    #[error("score missing or malformed")]
    ScoreParseError,
}

impl TryFrom<Pa> for PaWatchlistHit {
    type Error = PaWatchlistHitParseError;

    fn try_from(v: Pa) -> Result<Self, Self::Error> {
        let score = v
            .get_score()
            .map_err(|_| PaWatchlistHitParseError::ScoreParseError)?
            .ok_or(PaWatchlistHitParseError::ScoreParseError)?;

        Ok(Self {
            list: v.to_watchlist_enum(),
            score,
            dob: v.dob.clone(),
            record_type: v.record_type,
        })
    }
}

// TODO: unsure the enum here
impl Pa {
    fn to_watchlist_enum(&self) -> PaList {
        match self.list.as_str() {
            "Office of Foreign Asset Control" => PaList::OFAC,
            "OFAC SDN" => PaList::OFAC,
            "Politically Exposed Persons" => PaList::PEP,
            _ => PaList::NonSDNList,
        }
    }

    fn get_score(&self) -> Result<Option<i32>, std::num::ParseIntError> {
        self.score.as_ref().map(|s| s.parse::<i32>()).transpose()
    }
}

type CreateManualReview = bool;

impl Response {
    /// IDology-determined status for verifying the customer
    pub fn summary_status(&self) -> (DecisionStatus, CreateManualReview) {
        match self.summary_result.as_ref().map(|x| x.key.as_str()) {
            Some("id.success") => (DecisionStatus::Pass, false),
            Some("id.failure") => (DecisionStatus::Fail, false),
            _ => (DecisionStatus::Fail, true),
        }
    }

    /// Whether the ID was located on IDology
    pub fn id_located(&self) -> bool {
        if let Some(ref results) = self.results {
            results.key.starts_with("result.match")
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

#[cfg(test)]
mod tests {
    use super::*;
    use newtypes::IDologyReasonCode;
    use serde_json::json;
    use test_case::test_case;

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
        let reason_codes = response
            .response
            .qualifiers
            .unwrap()
            .parse_qualifiers()
            .into_iter()
            .map(|r| r.1)
            .collect::<Vec<IDologyReasonCode>>();
        assert_eq!(reason_codes, vec![IDologyReasonCode::IpNotLocated],)
    }

    #[test]
    fn test_idology_response_list() {
        let response = crate::test_fixtures::test_idology_expectid_response();
        let response = parse_response(response).expect("Could not parse response");
        let reason_codes = response
            .response
            .qualifiers
            .unwrap()
            .parse_qualifiers()
            .into_iter()
            .map(|r| r.1)
            .collect::<Vec<IDologyReasonCode>>();
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
        assert!(response.response.restriction.is_none());
    }

    #[test]
    fn test_restriction() {
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
                  "score": 98,
                  "dob": 11301960
                },
                {
                    "list": "Bad Boy list",
                    // strings
                    "score": "97",
                    "dob": "11301960"
                },
                {
                    "list": "Politically Exposed Persons",
                    "score": 67
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

        let raw_malformed_score = json!({"response": {
            "id-number": 3010453,
            "restriction": {
                "key": "global.watch.list",
                "message": "you are bad",
                "pa":
                  {
                      "list": "Bad Boy list",
                      "score": "this isn't a parsable int",
                  },
              },
        }});

        let response_single = parse_response(raw_single)
            .expect("Could not parse response")
            .response
            .restriction
            .unwrap();
        let response_multiple = parse_response(raw_multiple)
            .expect("Could not parse response")
            .response
            .restriction
            .unwrap();
        let response_missing_pa = parse_response(raw_missing_pa)
            .expect("Could not parse response")
            .response
            .restriction
            .unwrap();
        let response_malformed = parse_response(raw_malformed_pa)
            .expect("Could not parse response")
            .response
            .restriction
            .unwrap();
        let response_malformed_score = parse_response(raw_malformed_score)
            .expect("Could not parse response")
            .response
            .restriction
            .unwrap();
        // PA has 1 record
        assert_eq!(
            vec![PaWatchlistHit {
                list: PaList::OFAC,
                score: 97,
                dob: Some("02121978".to_owned()),
                record_type: None
            }],
            response_single.watchlists()
        );

        assert_eq!(
            vec![
                PaWatchlistHit {
                    list: PaList::OFAC,
                    score: 98,
                    dob: Some("11301960".to_owned()),
                    record_type: None
                },
                PaWatchlistHit {
                    list: PaList::NonSDNList,
                    score: 97,
                    dob: Some("11301960".to_owned()),
                    record_type: None
                },
                PaWatchlistHit {
                    list: PaList::PEP,
                    score: 67,
                    dob: None,
                    record_type: None
                }
            ],
            response_multiple.watchlists()
        );

        // Response missing PA
        assert!(response_missing_pa.watchlists().is_empty());

        // Malformed PA
        assert!(response_malformed.watchlists().is_empty());

        assert!(response_malformed_score.watchlists().is_empty());
    }

    #[test_case("result.match" => true)]
    #[test_case("result.match.restricted" => true)]
    #[test_case("result.no.match" => false)]
    fn test_id_located(results_key: &str) -> bool {
        Response {
            qualifiers: None,
            results: Some(KeyResponse {
                key: results_key.to_owned(),
            }),
            summary_result: None,
            id_number: None,
            id_scan: None,
            error: None,
            restriction: None,
        }
        .id_located()
    }
}
