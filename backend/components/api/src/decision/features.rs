/// This module is for taking parsed responses from vendors and transforming them into a FeatureVector
/// we can use to make decisions
use idv::ParsedResponse;

use itertools::Itertools;
use newtypes::{
    idology::IdologyScanOnboardingCaptureResult, DecisionStatus, FootprintReasonCode, Vendor, VendorAPI,
    VerificationResultId,
};

use super::vendor::{socure::SocureFeatures, vendor_result::VendorResult};

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IDologyFeatures {
    pub status: DecisionStatus,
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub id_located: bool,
    pub id_number_for_scan_required: Option<u64>,
    pub is_id_scan_required: bool,
    pub verification_result: VerificationResultId,
    pub create_manual_review: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IDologyScanOnboardingFeatures {
    pub status: DecisionStatus,
    pub verification_result: VerificationResultId,
}

// TODO!
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct TwilioFeatures {
    pub verification_result: VerificationResultId,
}

#[derive(Clone, Default, Debug)]
pub struct FeatureVector {
    pub idology_features: Option<IDologyFeatures>,
    pub idology_scan_onboarding_features: Option<IDologyScanOnboardingFeatures>,
    pub twilio_features: Option<TwilioFeatures>,
    pub socure_features: Option<SocureFeatures>,
}

impl FeatureVector {
    // The assumption (which is fine for now) is that we compute features from list of vendor responses
    // that are unique by vendor. So we "aggregate" by:
    //    Vec<VendorResponse> ---map--> Vec<FeatureVector> --reduce--> FeatureVector by merging optional fields
    // Every FeatureVector in the Vec<FeatureVector> should have only a single field non-optional
    fn merge(self, other: FeatureVector) -> Self {
        Self {
            idology_features: self.idology_features.or(other.idology_features),
            idology_scan_onboarding_features: self
                .idology_scan_onboarding_features
                .or(other.idology_scan_onboarding_features),
            twilio_features: self.twilio_features.or(other.twilio_features),
            socure_features: self.socure_features.or(other.socure_features),
        }
    }
}

impl FeatureVector {
    // A helper to expose all the verification_results
    pub fn verification_results(&self) -> Vec<VerificationResultId> {
        let idology_verification_result = self
            .idology_features
            .as_ref()
            .map(|i| i.verification_result.clone());
        let idology_scan_onboarding_verification_result = self
            .idology_scan_onboarding_features
            .as_ref()
            .map(|i| i.verification_result.clone());
        let twilio_verification_result = self
            .twilio_features
            .as_ref()
            .map(|i| i.verification_result.clone());
        let socure_verification_result = self
            .socure_features
            .as_ref()
            .map(|i| i.verification_result.clone());

        vec![
            idology_verification_result,
            idology_scan_onboarding_verification_result,
            twilio_verification_result,
            socure_verification_result,
        ]
        .into_iter()
        .flatten()
        .collect()
    }

    pub fn reason_codes_for_vendor_api(&self, vendor_api: &VendorAPI) -> Option<Vec<FootprintReasonCode>> {
        match vendor_api {
            VendorAPI::IdologyExpectID => self
                .idology_features
                .as_ref()
                .map(|i| i.footprint_reason_codes.clone()),
            VendorAPI::IdologyScanVerifySubmission => None,
            VendorAPI::IdologyScanVerifyResults => None,
            VendorAPI::IdologyScanOnboarding => None,
            VendorAPI::TwilioLookupV2 => None,
            VendorAPI::SocureIDPlus => self
                .socure_features
                .as_ref()
                .map(|f| f.footprint_reason_codes.clone()),
        }
    }

    pub fn consolidated_reason_codes(
        &self,
        vendor_apis_to_include: Vec<VendorAPI>,
    ) -> Vec<(FootprintReasonCode, Vec<Vendor>)> {
        let all_codes = vendor_apis_to_include
            .iter()
            .flat_map(|v| {
                self.reason_codes_for_vendor_api(v).map(|rcs| {
                    rcs.iter()
                        .map(|rc| (Vendor::from(v.to_owned()), rc.to_owned()))
                        .collect::<Vec<(Vendor, FootprintReasonCode)>>()
                })
            })
            .flatten();

        all_codes
            .into_iter()
            .sorted()
            .group_by(|t| t.1.clone())
            .into_iter()
            .map(|(footprint_reason_code, group)| {
                (
                    footprint_reason_code,
                    group
                        .into_iter()
                        .map(|(vendor, _)| vendor)
                        .unique()
                        .collect::<Vec<Vendor>>(),
                )
            })
            .collect()
    }
}

impl From<VendorResult> for FeatureVector {
    fn from(result: VendorResult) -> Self {
        let response = result.response;
        let verification_result_id = result.verification_result_id;
        match response.response {
            ParsedResponse::IDologyExpectID(resp) => {
                let r = resp.response;

                // TODO: fix this to just be id_located. Shouldn't have idv crate doing anything w.r.t. our DecisionStatus
                let (status, create_manual_review) = r.status();
                let mut footprint_reason_codes: Vec<FootprintReasonCode> = r.footprint_reason_codes();

                if r.max_watchlist_score().map(|s| s > 93).unwrap_or(false)
                    && !footprint_reason_codes.contains(&FootprintReasonCode::WatchlistHit)
                {
                    footprint_reason_codes.push(FootprintReasonCode::WatchlistHit)
                } else if r.has_potential_watchlist_hit()
                    && !footprint_reason_codes.contains(&FootprintReasonCode::PotentialWatchlistHit)
                {
                    footprint_reason_codes.push(FootprintReasonCode::PotentialWatchlistHit)
                }

                let idology_features = IDologyFeatures {
                    status,
                    create_manual_review,
                    id_located: r.id_located(),
                    is_id_scan_required: r.is_id_scan_required(),
                    id_number_for_scan_required: r.id_number,
                    verification_result: verification_result_id,
                    footprint_reason_codes,
                };
                Self {
                    idology_features: Some(idology_features),
                    idology_scan_onboarding_features: None,
                    twilio_features: None,
                    socure_features: None,
                }
            }
            // TODO!
            ParsedResponse::TwilioLookupV2(_) => Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: Some(TwilioFeatures {
                    verification_result: verification_result_id,
                }),
                socure_features: None,
            },
            ParsedResponse::SocureIDPlus(ref idplus_response) => Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: Some(SocureFeatures::from(idplus_response, verification_result_id)),
            },
            // TODO
            ParsedResponse::IDologyScanVerifySubmission(_) => Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: None,
            },

            // Writing down some context for future us:
            //
            // We send and handle Scan Onboarding requests in bifrost backend API.
            //  - This INCLUDES figuring out if `capture_result` includes an image error.
            //  - Capture result ONLY returns `complete`, `image_error`, `internal_error`
            //  - Document backend route will keep retrying if it sees an image or internal error
            //  - therefore, if we are in this codepath, we've already received a `complete` result (since we haven't implemented our own retry limit as of this writing)
            // That is, all this field gets us is whether the capturing was successful (not that the data is verified). This
            // makes sense since Scan Onboarding is mostly about collecting information and forwarding on to ExpectID.
            //
            // Therefore, we need to enable and use the `capture_decision` field in the Idology portal to actually get useful decisions from scan OB.
            // Alternatively, we need to parse the qualifiers and make out own risk based decision in risk.
            //
            // TLDR;
            // For now, let's just punt on incorporating scan OB status into our footprint decision, and can revisit when we have tenants. We'll defer to expectID response since we'll send along the scan OB
            // results to that. I'll keep this around since it's useful to save to PG (when we do that)
            ParsedResponse::IDologyScanOnboarding(ref scan_ob_resp) => {
                let status = scan_ob_resp
                    .response
                    .capture_result()
                    .map(|r| {
                        if r == IdologyScanOnboardingCaptureResult::Completed {
                            DecisionStatus::Pass
                        } else {
                            DecisionStatus::Fail
                        }
                    })
                    .unwrap_or(DecisionStatus::Fail);

                let features = IDologyScanOnboardingFeatures {
                    status,
                    verification_result: verification_result_id,
                };
                Self {
                    idology_features: None,
                    idology_scan_onboarding_features: Some(features),
                    twilio_features: None,
                    socure_features: None,
                }
            }
            _ => unimplemented!(),
        }
    }
}

// From an array of VendorResponses, create our FeatureVector
// 2022-10-15: This won't be the way we do this forever, but let's start here and revisit as we have a better idea on how we want
//   to aggregate and compute features. once we have more complex features and scoring (aggregations/models and so on) we'll likely want a separate
//   risk features/scoring service
#[tracing::instrument(skip_all)]
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

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use crate::decision::vendor::socure::SocureBaselineIdPlusLogicV6Result;

    use super::*;
    use idv::{
        idology::error::Error as IdologyError,
        idology::expectid::response::{self as idology_verification, ExpectIDResponse},
        socure::response::SocureIDPlusResponse,
        ParsedResponse, VendorResponse,
    };
    use newtypes::{Vendor, VerificationRequestId};
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
            status: DecisionStatus::Pass,
            create_manual_review: false,
            id_located: true,
            is_id_scan_required: false,
            id_number_for_scan_required: Some(3010453),
            footprint_reason_codes: vec![
                FootprintReasonCode::IpNotLocated,
                FootprintReasonCode::AddressStreetNameDoesNotMatch,
                FootprintReasonCode::WatchlistHit,
            ],
            verification_result: idology_result.verification_result_id,
        };
        let expected_feature_vector = FeatureVector {
            idology_features: Some(expected_idology_features),
            idology_scan_onboarding_features: None,
            twilio_features: None,
            socure_features: None,
        };
        assert_eq!(
            expected_feature_vector.idology_features,
            feature_vector.idology_features
        );
        assert!(feature_vector.twilio_features.is_none());
        assert!(feature_vector.socure_features.is_none());

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
          "restriction": {
            "key": "global.watch.list",
            "message": "you are bad",
            "pa": [
                {
                "list": "Office of Foreign Asset Control",
                "score": "97",
                "dob": "02121978"
              },
              {
              "list": "Office of Foreign Asset Control",
                "score": "43",
                "dob": "02121978"
              },
            ]
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

        let parsed_response: ExpectIDResponse = idology_verification::parse_response(raw.clone())?;

        let res = VendorResponse {
            vendor: Vendor::Idology,
            response: ParsedResponse::IDologyExpectID(parsed_response),
            raw_response: raw.into(),
        };
        let result = VendorResult {
            response: res,
            verification_result_id: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d")
                .unwrap(),
            verification_request_id: VerificationRequestId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d")
                .unwrap(),
            structured_vendor_response: None,
        };

        Ok(result)
    }

    #[test]
    fn test_consolidated_reason_codes() {
        let feature_vector = FeatureVector {
            idology_features: Some(IDologyFeatures {
                status: DecisionStatus::Pass,
                footprint_reason_codes: vec![
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::NameLastDoesNotMatch,
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::SubjectDeceased,
                ],
                id_located: false,
                id_number_for_scan_required: None,
                is_id_scan_required: false,
                verification_result: VerificationResultId::from("123".to_owned()),
                create_manual_review: false,
            }),
            idology_scan_onboarding_features: None,
            twilio_features: None,
            socure_features: Some(SocureFeatures {
                idplus_response: SocureIDPlusResponse {
                    reference_id: String::from("abc"),
                    ..Default::default()
                },
                baseline_id_plus_logic_v6_result: SocureBaselineIdPlusLogicV6Result::Accept,
                decision_status: DecisionStatus::Pass,
                create_manual_review: false,
                verification_result: VerificationResultId::from("456".to_owned()),
                reason_codes: vec![],
                footprint_reason_codes: vec![
                    FootprintReasonCode::SsnIssuedPriorToDob,
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::SsnIssuedPriorToDob,
                ],
            }),
        };
        // no output when no input VendorAPI's are specified
        assert_eq!(0, feature_vector.consolidated_reason_codes(vec![]).len());
        // only reason codes from specified VendorAPI's are included in output
        assert!(have_same_elements(
            vec![
                (FootprintReasonCode::SubjectDeceased, vec![Vendor::Idology]),
                (FootprintReasonCode::NameLastDoesNotMatch, vec![Vendor::Idology]),
            ],
            feature_vector.consolidated_reason_codes(vec![VendorAPI::IdologyExpectID])
        ));

        let yo = feature_vector
            .consolidated_reason_codes(vec![VendorAPI::IdologyExpectID, VendorAPI::SocureIDPlus]);
        // correctly consolidates by vendor
        assert!(have_same_elements(
            vec![
                (
                    FootprintReasonCode::SubjectDeceased,
                    vec![Vendor::Idology, Vendor::Socure]
                ),
                (FootprintReasonCode::NameLastDoesNotMatch, vec![Vendor::Idology]),
                (FootprintReasonCode::SsnIssuedPriorToDob, vec![Vendor::Socure]),
            ],
            yo
        ));
    }

    fn have_same_elements<T>(l: Vec<T>, r: Vec<T>) -> bool
    where
        T: Eq,
    {
        l.iter().all(|i| r.contains(i)) && r.iter().all(|i| l.contains(i)) && l.len() == r.len()
    }
}
