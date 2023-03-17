use crate::idology::{
    error as IdologyError,
    common::response::{IDologyQualifiers, IdologyResponseHelpers, KeyResponse, WarmAddressType, from_string_or_int},
    IdologyError::RequestError,
};
use itertools::Itertools;
use newtypes::{DecisionStatus, FootprintReasonCode, IDologyReasonCode};
use std::str::FromStr;

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
    // If the customer's name is located on any of the Patriot Act watchlists (or on THE OFAC list only, if that option is set in the IDCenter),
    // then the ExpectID PA response will be enclosed in the <restriction> tag,
    pub restriction: Option<Restriction>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, PartialEq, Eq)]
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
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    pub score: Option<String>,
    pub record_type: Option<String>,
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
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

    pub fn get_score(&self) -> Result<Option<i32>, std::num::ParseIntError> {
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

    pub fn footprint_reason_codes(&self) -> Vec<FootprintReasonCode> {
        if let Some(ref qualifiers) = self.qualifiers {
            qualifiers
                .parse_qualifiers()
                .into_iter()
                .flat_map(|q| match q.1 {
                    IDologyReasonCode::WarmInputAddressAlert => {
                        q.0.warm_address_list
                            .and_then(|s| WarmAddressType::from_str(s.as_str()).ok())
                            .map(|t| t.to_input_address_footprint_reason_code())
                    }
                    IDologyReasonCode::WarmAddressAlert => {
                        q.0.warm_address_list
                            .and_then(|s| WarmAddressType::from_str(s.as_str()).ok())
                            .map(|t| t.to_located_address_footprint_reason_code())
                    }
                    _ => Into::<Option<FootprintReasonCode>>::into(&q.1),
                })
                .collect()
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

            if let Some(response_lists) = r.parse_pa() {
                response_lists
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

    pub fn max_watchlist_score(&self) -> Option<i32> {
        self.restriction.as_ref().and_then(|r| r.parse_pa().and_then(|response_lists| 
                response_lists
                    .iter()
                    .flat_map(|p| {
                        let score_res = p.get_score();
                        match score_res {
                            Ok(s) => s,
                            Err(_) => {
                                tracing::warn!(score=%format!("{:?}", p.score), "error parsing watchlist score");
                                None
                            }
                        }
                    })
                    .max()
            
        ))
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
        assert!(response.response.watchlists().is_none())
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
            .response;
        let response_multiple = parse_response(raw_multiple)
            .expect("Could not parse response")
            .response;
        let response_missing_pa = parse_response(raw_missing_pa)
            .expect("Could not parse response")
            .response;
        let response_malformed = parse_response(raw_malformed_pa)
            .expect("Could not parse response")
            .response;
        let response_malformed_score = parse_response(raw_malformed_score)
            .expect("Could not parse response")
            .response;
        // PA has 1 record
        assert_eq!(vec![PaList::OFAC], response_single.watchlists().unwrap());
        assert_eq!(Some(97), response_single.max_watchlist_score());

        // PA has 2 records
        assert_eq!(
            vec![PaList::OFAC, PaList::OtherWatchlist],
            response_multiple.watchlists().unwrap()
        );
        assert_eq!(Some(98), response_multiple.max_watchlist_score());

        // Response missing PA
        assert_eq!(
            vec![PaList::OtherWatchlist],
            response_missing_pa.watchlists().unwrap()
        );
        assert_eq!(None, response_missing_pa.max_watchlist_score());

        // Malformed PA
        assert_eq!(
            vec![PaList::OtherWatchlist],
            response_malformed.watchlists().unwrap()
        );
        assert_eq!(None, response_malformed.max_watchlist_score());

        // Malformed score
        assert_eq!(None, response_malformed_score.max_watchlist_score())
    }

    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "mail drop"}) => vec![FootprintReasonCode::AddressLocatedIsNotStandardMailDrop])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "hospital"}) => vec![FootprintReasonCode::AddressLocatedIsNotStandardHospital])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "hotel"}) => vec![FootprintReasonCode::AddressLocatedIsNotStandardHotel])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "prison"}) => vec![FootprintReasonCode::AddressLocatedIsNotStandardPrison])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "campground"}) => vec![FootprintReasonCode::AddressLocatedIsNotStandardCampground])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "college"}) => vec![FootprintReasonCode::AddressLocatedIsNotStandardCollege])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "university"}) => vec![FootprintReasonCode::AddressLocatedIsNotStandardUniversity])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "USPO"}) => vec![FootprintReasonCode::AddressLocatedIsNotStandardUspo])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "General Delivery"}) => vec![FootprintReasonCode::AddressLocatedIsNotStandardGeneralDelivery])]
    #[test_case(json!([
        {
          "key": "resultcode.warm.input.address.alert",
          "warm-address-list": "General Delivery"
        },
        {
          "key": "resultcode.address.velocity.alert",
        },
        {
            "key": "resultcode.warm.input.address.alert",
            "warm-address-list": "hotel"
        },
      ]) => vec![FootprintReasonCode::AddressInputIsNotStandardGeneralDelivery, FootprintReasonCode::AddressAlertVelocity, FootprintReasonCode::AddressInputIsNotStandardHotel])]
    fn test_parse_footprint_reason_codes(qualifier: serde_json::Value) -> Vec<FootprintReasonCode> {
        Response {
            qualifiers: Some(IDologyQualifiers { qualifier }),
            results: None,
            summary_result: None,
            id_number: None,
            id_scan: None,
            error: None,
            restriction: None,
        }
        .footprint_reason_codes()
    }

    #[test_case("result.match" => true)]
    #[test_case("result.match.restricted" => true)]
    #[test_case("result.no.match" => false)]
    fn test_id_located(results_key: &str) -> bool {
        Response {
            qualifiers: None,
            results: Some(KeyResponse {
                key: results_key.to_owned()
            }),
            summary_result: None,
            id_number: None,
            id_scan: None,
            error: None,
            restriction: None,
        }.id_located()
    }

}
