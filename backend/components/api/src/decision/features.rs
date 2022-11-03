/// This module is for taking parsed responses from vendors and transforming them into a FeatureVector
/// we can use to make decisions
use idv::{idology::verification::IDologySuccess, ParsedResponse};

use newtypes::{OnboardingStatus, Signal, VerificationResultId};

use super::vendor_result::VendorResult;

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IDologyFeatures {
    pub status: OnboardingStatus,
    pub signals: Vec<Signal>,
    pub id_located: bool,
    pub id_number_for_scan_required: Option<i32>,
    pub is_id_scan_required: bool,
    pub verification_result: VerificationResultId,
}

impl IDologyFeatures {
    fn signals_from_response_qualifiers(response: IDologySuccess) -> Vec<Signal> {
        let qualifiers = response.parse_qualifiers();

        // TODO move this logic into decision engine
        qualifiers.into_iter().map(|r| r.signal()).collect()
    }
}

// TODO!
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct TwilioFeatures {
    pub verification_result: VerificationResultId,
}

#[derive(Clone, Default, PartialEq, Eq, Debug)]
pub struct FeatureVector {
    pub idology_features: Option<IDologyFeatures>,
    pub twilio_features: Option<TwilioFeatures>,
}

impl FeatureVector {
    // The assumption (which is fine for now) is that we compute features from list of vendor responses
    // that are unique by vendor. So we "aggregate" by:
    //    Vec<VendorResponse> ---map--> Vec<FeatureVector> --reduce--> FeatureVector by merging optional fields
    // Every FeatureVector in the Vec<FeatureVector> should have only a single field non-optional
    fn merge(self, other: FeatureVector) -> Self {
        Self {
            idology_features: self.idology_features.or(other.idology_features),
            twilio_features: self.twilio_features.or(other.twilio_features),
        }
    }
}

impl FeatureVector {
    // A helper to expose all the top level statuses from the individual vendors
    pub fn statuses(&self) -> Vec<Option<OnboardingStatus>> {
        let idology_status = self.idology_features.as_ref().map(|i| i.status);

        vec![idology_status]
    }

    // A helper to expose all the verification_results
    pub fn verification_results(&self) -> Vec<VerificationResultId> {
        let idology_verification_result = self
            .idology_features
            .as_ref()
            .map(|i| i.verification_result.clone());
        let twilio_verification_result = self
            .twilio_features
            .as_ref()
            .map(|i| i.verification_result.clone());

        vec![idology_verification_result, twilio_verification_result]
            .into_iter()
            .flatten()
            .collect()
    }
}

impl From<VendorResult> for FeatureVector {
    fn from(result: VendorResult) -> Self {
        let response = result.response;
        let verification_result_id = result.verification_result_id;
        match response.response {
            ParsedResponse::IDology(resp) => {
                let r = resp.response;

                let idology_features = IDologyFeatures {
                    status: r.status(),
                    id_located: r.id_located(),
                    is_id_scan_required: r.is_id_scan_required(),
                    id_number_for_scan_required: r.id_number,
                    signals: IDologyFeatures::signals_from_response_qualifiers(r),
                    verification_result: verification_result_id,
                };
                Self {
                    idology_features: Some(idology_features),
                    twilio_features: None,
                }
            }
            // TODO!
            ParsedResponse::Twilio(_) => Self {
                idology_features: None,
                twilio_features: Some(TwilioFeatures {
                    verification_result: verification_result_id,
                }),
            },
        }
    }
}

// From an array of VendorResponses, create our FeatureVector
// 2022-10-15: This won't be the way we do this forever, but let's start here and revisit as we have a better idea on how we want
//   to aggregate and compute features. once we have more complex features and scoring (aggregations/models and so on) we'll likely want a separate
//   risk features/scoring service
pub fn create_features(results: Vec<VendorResult>) -> FeatureVector {
    let base_features = FeatureVector::default();

    results
        .into_iter()
        .fold(base_features, |acc, v| acc.merge(FeatureVector::from(v)))
}

mod helpers {
    use itertools::Itertools;
    use levenshtein::levenshtein;

    #[allow(dead_code)] // temp
    pub(super) fn smart_name_distance(name1: &str, name2: &str) -> Option<usize> {
        let clean_and_split = |s: &str| -> Vec<String> {
            let s = s.trim().to_uppercase();
            s.split(' ')
                .map(|x| x.chars().filter(|c| c.is_alphanumeric()).collect::<String>())
                .collect()
        };
        let name1_parts = clean_and_split(name1);
        let name2_parts = clean_and_split(name2);

        if name1_parts.len() < 2 || name2_parts.len() < 2 {
            return None;
        }

        // Where N is the number of words in name1, select all length-N permutations of name2_parts.
        // Choose the permutation that yields the smallest levenshtein difference.
        // This has a few benefits:
        // - We ignore differences in the ordering of names
        // - We remove extra names from name2, like a middle name
        name2_parts
            .into_iter()
            .permutations(name1_parts.len())
            .map(|name2_parts| {
                // Calculate the sum of levenshtein difference between parts of name1 and name2 zipped
                name2_parts
                    .iter()
                    .zip(name1_parts.iter())
                    .map(|(x, y)| levenshtein(x, y))
                    .sum()
            })
            .min()
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;
    use idv::{
        idology::verification::{self as idology_verification, IDologyResponse},
        idology::Error as IdologyError,
        ParsedResponse, VendorResponse,
    };
    use newtypes::{OldSignalSeverity, SignalScope, Vendor, VerificationRequestId};
    use serde_json::json;
    use test_case::test_case;
    // Feature tests
    // TODO: add in twilio
    // My concern is that these test asserts require `Debug` trait to be derived. Will this work
    // for results that contain PII? I think this is a trickier problem, hence will do this for now
    #[test]
    fn test_features() -> Result<(), IdologyError> {
        let idology_result = create_idology_vendor_result("id.success")?;
        let vendor_results = vec![idology_result.clone()];

        let feature_vector = create_features(vendor_results);
        let expected_idology_features = IDologyFeatures {
            status: OnboardingStatus::Verified,
            id_located: true,
            is_id_scan_required: false,
            id_number_for_scan_required: Some(3010453),
            signals: vec![
                Signal {
                    kind: OldSignalSeverity::NotFound,
                    scopes: vec![SignalScope::IpAddress],
                    note: "resultcode.ip.not.located".to_string(),
                },
                Signal {
                    kind: OldSignalSeverity::Alert(2),
                    scopes: vec![SignalScope::StreetAddress],
                    note: "resultcode.street.name.does.not.match".to_string(),
                },
            ],
            verification_result: idology_result.verification_result_id,
        };
        let expected_feature_vector = FeatureVector {
            idology_features: Some(expected_idology_features),
            twilio_features: None,
        };
        assert_eq!(expected_feature_vector, feature_vector);

        Ok(())
    }

    // Helpers tests
    #[test_case("elliott forde", "ElLioTt ForDe" => Some(0))]
    #[test_case("elliott forde", "FORDE, ELLIOTT" => Some(0))]
    #[test_case("elliott forde", "FORDE ELLIOT" => Some(1))]
    #[test_case("elliott forde", "FORDE ELLIOTT VETLE" => Some(0))]
    #[test_case("forde elliott", "ELLIOTT FORDE VETLE" => Some(0))]
    #[test_case("elliott forde", "CONRAD FORDE" => Some(7))]
    #[test_case("elliott", "elliott forde" => None)]
    #[test_case("elliott forde", "elliott" => None)]
    #[test_case("elliott forde", "" => None)]
    fn test_good_emails(name1: &str, name2: &str) -> Option<usize> {
        helpers::smart_name_distance(name1, name2)
    }

    fn create_idology_vendor_result(summary_result_key: &str) -> Result<VendorResult, IdologyError> {
        let raw = json!({"response": {
          "id-number": 3010453,
          "summary-result": {
            "key": summary_result_key,
            "message": "Not used in tests yet"
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
        }});

        let parsed_response: IDologyResponse = idology_verification::parse_response(raw.clone())?;

        let res = VendorResponse {
            vendor: Vendor::Idology,
            response: ParsedResponse::IDology(parsed_response),
            raw_response: raw,
        };
        let result = VendorResult {
            response: res,
            verification_result_id: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d")
                .unwrap(),
            verification_request_id: VerificationRequestId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d")
                .unwrap(),
        };

        Ok(result)
    }
}
