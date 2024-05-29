pub mod client;
mod conversion;
use newtypes::{
    IdvData,
    PiiJsonValue,
    PiiString,
};
pub mod reason_code;
pub mod requirements;
pub mod response;
use self::response::SocureIDPlusResponse;
use serde::de::DeserializeOwned;
use std::fmt::Display;
use thiserror::Error;

pub struct SocureIDPlusRequest {
    pub idv_data: IdvData,
    pub socure_device_session_id: Option<String>,
    pub ip_address: Option<PiiString>,
}

#[derive(Clone)]
pub struct SocureIDPlusAPIResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: SocureIDPlusResponse,
}

pub async fn decode_response<T: DeserializeOwned>(response: reqwest::Response) -> Result<T, Error> {
    if response.status().is_success() {
        Ok(response.json().await?)
    } else {
        let text = response.text().await?;
        let api_error_response = serde_json::from_str::<ApiErrorResponse>(&text).map(Error::Api);
        Err(api_error_response.unwrap_or(Error::SocureErrorResponse(text)))
    }
}

pub fn parse_response(value: serde_json::Value) -> Result<SocureIDPlusResponse, Error> {
    let response: SocureIDPlusResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("request error: {0}")]
    Request(#[from] reqwest::Error),
    #[error("socure type conversion error: {0}")]
    ConversionEror(#[from] SocureConversionError),
    #[error("internal reqwest error: {0}")]
    InernalReqwestError(#[from] SocureReqwestError),
    // TODO: don't show this
    #[error("error from socure api: {0}")]
    SocureErrorResponse(String),
    #[error("api error: {0}")]
    Api(ApiErrorResponse),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Error)]
#[serde(rename_all = "camelCase")]
pub struct ApiErrorResponse {
    pub status: Option<String>,
    pub reference_id: String,
    pub data: Option<serde_json::Value>, // can be an array or an object
    pub msg: String,
}

impl Display for ApiErrorResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.msg)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum SocureConversionError {
    #[error("zip code is unsupported length for socure API validation")]
    UnsupportedZipFormat,
    #[error("address not present for user")]
    NoAddressPresent,
    #[error("First name must be provided")]
    MissingFirstName,
    #[error("Last name must be provided")]
    MissingLastName,
    #[error("Last name must be provided")]
    MissingCountry,
}

#[derive(Debug, thiserror::Error)]
pub enum SocureReqwestError {
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to socure api: {0}")]
    ReqwestSendError(String),
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::socure::response::{
        GlobalWatchlist,
        GlobalWatchlistMatch,
        GlobalWatchlistMatchComment,
    };
    use newtypes::ScrubbedPiiString;
    use serde_json::{
        json,
        Value,
    };
    use std::collections::HashMap;

    #[test]
    fn test_parse_response() {
        let response_json: Value = json!({
            "referenceId": "b8f0508f-1600-48f0-aad9-b7f7afbec318",
            "nameAddressCorrelation": {
              "reasonCodes": [
                "I709",
                "I710",
                "I708"
              ],
              "score": 0.99
            },
            "nameEmailCorrelation": {
              "reasonCodes": [
                "I556",
                "I557",
                "I558"
              ],
              "score": 0.99
            },
            "namePhoneCorrelation": {
              "reasonCodes": [
                "I618",
                "I621",
                "I622"
              ],
              "score": 0.99
            },
            "fraud": {
              "reasonCodes": [
                "I553",
                "I121",
                "I127"
              ],
              "scores": [
                {
                  "name": "sigma",
                  "version": "3.0",
                  "score": 0.488
                }
              ]
            },
            "kyc": {
              "reasonCodes": [
                "I919"
              ],
              "fieldValidations": {
                "firstName": 0.99,
                "surName": 0.99,
                "streetAddress": 0.99,
                "city": 0.99,
                "state": 0.99,
                "zip": 0.99,
                "mobileNumber": 0.99,
                "dob": 0.99,
                "ssn": 0.99
              }
            },
            "addressRisk": {
              "reasonCodes": [
                "I707",
                "I704",
                "I708"
              ],
              "score": 0.01
            },
            "emailRisk": {
              "reasonCodes": [
                "I520",
                "I555"
              ],
              "score": 0.01
            },
            "phoneRisk": {
              "reasonCodes": [
                "I620",
                "I611",
                "I602"
              ],
              "score": 0.01
            },
            "alertList": {
              "reasonCodes": [],
              "matches": []
            },
            "globalWatchlist": {
              "reasonCodes": [
                "I196"
              ],
              "matches": {}
            }
          }
        );

        let decoded_response = parse_response(response_json).expect("Failed to parse!!");
        println!("{:?}", decoded_response);
    }

    #[test]
    fn watchlist_response_parsing() {
        let response_json: Value = json!({
          "referenceId": "da6b24ce-de30-4fdf-8536-723569e5300c",
          "globalWatchlist": {
            "reasonCodes": [
              "R184",
              "R186"
            ],
            "matches": {
              "PEP Data": [
                {
                  "entityId": "ZaP+/U4QWUgpfG5fDlsPzz3ul+37G0Q",
                  "matchFields": [
                    "nameEquivalent"
                  ],
                  "sourceUrls": [
                    "https://www.socure.com"
                  ],
                  "comments": {
                    "name": [
                      "John C. Doe"
                    ],
                    "originalCountryText": [
                      "EN, Politician"
                    ],
                    "aka": [
                      "John Doe"
                    ],
                    "politicalPosition": [
                      "Child of Henry Doe (Politician)"
                    ],
                    "offense": [
                      "Pep,Pep Class 2,Pep Class 4"
                    ]
                  },
                  "matchScore": 98
                },
                {
                  "entityId": "ZaP+/U4QWUgjZmsjDltrtDGFl5D6Alw",
                  "matchFields": [
                    "nameExact"
                  ],
                  "sourceUrls": [
                    "https://www.example.org/members/current/ministers"
                  ],
                  "comments": {
                    "name": [
                      "John Doe"
                    ],
                    "originalCountryText": [
                      "Any Country"
                    ],
                    "country": [
                      "Any Country"
                    ],
                    "chamber": [
                      "Cabinet of Ministers"
                    ],
                    "sourceName": [
                      "Any Country State Cabinet"
                    ],
                    "locationurl": [
                      "https://www.example.org/members/all/john_doe"
                    ],
                    "aka": [
                      "Doe John",
                      "Jack Doe"
                    ],
                    "region": [
                      "Ontario"
                    ],
                    "offense": [
                      "Pep Class 2"
                    ],
                    "otherInfo": [
                      "Premier"
                    ]
                  },
                  "matchScore": 97
                }
              ]
            }
          }
        }
        );

        let decoded_response = parse_response(response_json).expect("Failed to parse!!");
        assert_eq!(
            Some(GlobalWatchlist {
                reason_codes: vec!["R184".to_owned(), "R186".to_owned()],
                matches: HashMap::from([(
                    "PEP Data".to_owned(),
                    vec![
                        GlobalWatchlistMatch {
                            entity_id: "ZaP+/U4QWUgpfG5fDlsPzz3ul+37G0Q".to_owned(),
                            match_fields: Some(vec!["nameEquivalent".to_owned()]),
                            source_urls: Some(vec!["https://www.socure.com".to_owned()]),
                            comments: Some(GlobalWatchlistMatchComment {
                                name: Some(vec![ScrubbedPiiString::new(PiiString::new(
                                    "John C. Doe".to_owned()
                                ))]),
                                original_country_text: Some(vec!["EN, Politician".to_owned()]),
                                aka: Some(vec![ScrubbedPiiString::new(PiiString::new(
                                    "John Doe".to_owned()
                                ))]),
                                political_position: Some(vec!["Child of Henry Doe (Politician)".to_owned()]),
                                offense: Some(vec!["Pep,Pep Class 2,Pep Class 4".to_owned()])
                            }),
                            match_score: Some(98.0)
                        },
                        GlobalWatchlistMatch {
                            entity_id: "ZaP+/U4QWUgjZmsjDltrtDGFl5D6Alw".to_owned(),
                            match_fields: Some(vec!["nameExact".to_owned()]),
                            source_urls: Some(vec![
                                "https://www.example.org/members/current/ministers".to_owned()
                            ]),
                            comments: Some(GlobalWatchlistMatchComment {
                                name: Some(vec![ScrubbedPiiString::new(PiiString::from(
                                    "John Doe".to_owned()
                                ))]),
                                original_country_text: Some(vec!["Any Country".to_owned()]),
                                aka: Some(vec![
                                    ScrubbedPiiString::new(PiiString::new("Doe John".to_owned())),
                                    ScrubbedPiiString::new(PiiString::new("Jack Doe".to_owned()))
                                ]),
                                political_position: None,
                                offense: Some(vec!["Pep Class 2".to_owned()])
                            }),
                            match_score: Some(97.0)
                        }
                    ]
                )])
            }),
            decoded_response.global_watchlist
        );
    }
}
