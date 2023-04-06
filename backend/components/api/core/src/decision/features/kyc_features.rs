/// This module is for taking parsed responses from vendors and transforming them into a FeatureVector
/// we can use to make decisions
use idv::ParsedResponse;

use itertools::Itertools;
use newtypes::{FootprintReasonCode, Vendor, VendorAPI, VerificationResultId};
use strum::IntoEnumIterator;

use crate::decision::vendor::vendor_result::VendorResult;

use super::{
    experian::ExperianFeatures, idology_expectid::IDologyFeatures,
    idology_scan_onboarding::IDologyScanOnboardingFeatures, socure_idplus::SocureFeatures,
};

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
    pub experian_features: Option<ExperianFeatures>,
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
            experian_features: self.experian_features.or(other.experian_features),
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
        let experian_verification_result = self
            .experian_features
            .as_ref()
            .map(|i| i.verification_result_id.clone());

        vec![
            idology_verification_result,
            idology_scan_onboarding_verification_result,
            twilio_verification_result,
            socure_verification_result,
            experian_verification_result,
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
                .map(|i| Self::enrich_idology_reason_codes_with_info_codes(i.footprint_reason_codes.clone())),
            VendorAPI::IdologyScanVerifySubmission => None,
            VendorAPI::IdologyScanVerifyResults => None,
            VendorAPI::IdologyScanOnboarding => None,
            VendorAPI::TwilioLookupV2 => None,
            VendorAPI::ExperianPreciseID => self
                .experian_features
                .as_ref()
                .map(|f| f.footprint_reason_codes.clone()),
            VendorAPI::SocureIDPlus => self
                .socure_features
                .as_ref()
                .map(|f| f.footprint_reason_codes.clone()),
            VendorAPI::IdologyPa => None,
            VendorAPI::MiddeskCreateBusiness => None,
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

    /// Based on the set of computed reason codes, add in `Info` codes for idology.
    /// Other vendors might require different logic
    pub fn enrich_idology_reason_codes_with_info_codes(
        mut reason_codes: Vec<FootprintReasonCode>,
    ) -> Vec<FootprintReasonCode> {
        // Add in info codes ONLY if we've located the identity
        if !reason_codes.contains(&FootprintReasonCode::IdNotLocated) {
            FootprintReasonCode::iter().for_each(|r| {
                if let Some(info_code) = r.to_info_code() {
                    if !reason_codes.contains(&r) {
                        reason_codes.push(info_code)
                    }
                }
            });
        }

        reason_codes
    }
}

impl From<VendorResult> for FeatureVector {
    fn from(result: VendorResult) -> Self {
        let response = result.response;
        let verification_result_id = result.verification_result_id;
        match response.response {
            ParsedResponse::IDologyExpectID(resp) => Self {
                idology_features: Some(IDologyFeatures::from(resp, verification_result_id)),
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: None,
                experian_features: None,
            },
            // TODO!
            ParsedResponse::TwilioLookupV2(_) => Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: Some(TwilioFeatures {
                    verification_result: verification_result_id,
                }),
                socure_features: None,
                experian_features: None,
            },
            ParsedResponse::SocureIDPlus(ref idplus_response) => Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: Some(SocureFeatures::from(idplus_response, verification_result_id)),
                experian_features: None,
            },
            // TODO
            ParsedResponse::IDologyScanVerifySubmission(_) => Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: None,
                experian_features: None,
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
            ParsedResponse::IDologyScanOnboarding(ref scan_ob_resp) => Self {
                idology_features: None,
                idology_scan_onboarding_features: Some(IDologyScanOnboardingFeatures::from(
                    scan_ob_resp,
                    verification_result_id,
                )),
                twilio_features: None,
                socure_features: None,
                experian_features: None,
            },
            ParsedResponse::ExperianPreciseID(resp) => Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: None,
                experian_features: Some(ExperianFeatures::from(resp, verification_result_id)),
            },
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

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests {
    use std::{fmt::Debug, panic, str::FromStr};

    use crate::decision::features::socure_idplus::SocureBaselineIdPlusLogicV6Result;

    use super::*;
    use idv::{
        idology::error::Error as IdologyError,
        idology::expectid::response::{self as idology_verification, ExpectIDResponse},
        socure::response::SocureIDPlusResponse,
        ParsedResponse, VendorResponse,
    };
    use newtypes::{DecisionStatus, Vendor, VerificationRequestId};
    use serde_json::json;
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
            is_id_scan_required: false,
            id_number_for_scan_required: Some(3010453),
            footprint_reason_codes: vec![
                FootprintReasonCode::IpNotLocated,
                FootprintReasonCode::AddressStreetNameDoesNotMatch,
                FootprintReasonCode::WatchlistHitOfac,
            ],
            verification_result: idology_result.verification_result_id,
        };
        let expected_feature_vector = FeatureVector {
            idology_features: Some(expected_idology_features),
            idology_scan_onboarding_features: None,
            twilio_features: None,
            socure_features: None,
            experian_features: None,
        };
        assert_eq!(
            expected_feature_vector.idology_features,
            feature_vector.idology_features
        );
        assert!(feature_vector.twilio_features.is_none());
        assert!(feature_vector.socure_features.is_none());
        assert!(feature_vector.experian_features.is_none());

        Ok(())
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
            response: ParsedResponse::IDologyExpectID(parsed_response),
            raw_response: raw.into(),
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

    #[test]
    fn test_consolidated_reason_codes() {
        let feature_vector = FeatureVector {
            idology_features: Some(IDologyFeatures {
                footprint_reason_codes: vec![
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::NameLastDoesNotMatch,
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::IdNotLocated,
                ],
                id_number_for_scan_required: None,
                is_id_scan_required: false,
                verification_result: VerificationResultId::from("123".to_owned()),
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
            experian_features: None,
        };
        // no output when no input VendorAPI's are specified
        assert_eq!(0, feature_vector.consolidated_reason_codes(vec![]).len());
        // only reason codes from specified VendorAPI's are included in output
        assert_have_same_elements(
            vec![
                (FootprintReasonCode::SubjectDeceased, vec![Vendor::Idology]),
                (FootprintReasonCode::NameLastDoesNotMatch, vec![Vendor::Idology]),
                (FootprintReasonCode::IdNotLocated, vec![Vendor::Idology]),
            ],
            feature_vector.consolidated_reason_codes(vec![VendorAPI::IdologyExpectID]),
        );

        let yo = feature_vector
            .consolidated_reason_codes(vec![VendorAPI::IdologyExpectID, VendorAPI::SocureIDPlus]);
        // correctly consolidates by vendor
        assert_have_same_elements(
            vec![
                (
                    FootprintReasonCode::SubjectDeceased,
                    vec![Vendor::Idology, Vendor::Socure],
                ),
                (FootprintReasonCode::NameLastDoesNotMatch, vec![Vendor::Idology]),
                (FootprintReasonCode::SsnIssuedPriorToDob, vec![Vendor::Socure]),
                (FootprintReasonCode::IdNotLocated, vec![Vendor::Idology]),
            ],
            yo,
        );

        // Info codes
        let feature_vector_id_located = FeatureVector {
            idology_features: Some(IDologyFeatures {
                footprint_reason_codes: vec![
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::NameLastDoesNotMatch,
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::IpStateDoesNotMatch,
                ],
                id_number_for_scan_required: None,
                is_id_scan_required: false,
                verification_result: VerificationResultId::from("123".to_owned()),
            }),
            ..Default::default()
        };

        let idology_reason_codes_with_info =
            feature_vector_id_located.consolidated_reason_codes(vec![VendorAPI::IdologyExpectID]);
        let expected_codes = vec![
            (FootprintReasonCode::SubjectDeceased, vec![Vendor::Idology]),
            // Note: the last name and IpState do not match, so they do NOT appear as info reason codes
            (FootprintReasonCode::NameLastDoesNotMatch, vec![Vendor::Idology]),
            (FootprintReasonCode::IpStateDoesNotMatch, vec![Vendor::Idology]),
            // All other info codes present, though
            (FootprintReasonCode::AddressMatches, vec![Vendor::Idology]),
            (FootprintReasonCode::AddressZipCodeMatches, vec![Vendor::Idology]),
            (
                FootprintReasonCode::AddressStreetNameMatches,
                vec![Vendor::Idology],
            ),
            (
                FootprintReasonCode::AddressStreetNumberMatches,
                vec![Vendor::Idology],
            ),
            (FootprintReasonCode::AddressStateMatches, vec![Vendor::Idology]),
            (FootprintReasonCode::DobYobMatches, vec![Vendor::Idology]),
            (FootprintReasonCode::DobMobMatches, vec![Vendor::Idology]),
            (FootprintReasonCode::SsnMatches, vec![Vendor::Idology]),
            (FootprintReasonCode::PhoneNumberMatches, vec![Vendor::Idology]),
            (
                FootprintReasonCode::InputPhoneNumberMatchesInputState,
                vec![Vendor::Idology],
            ),
            (
                FootprintReasonCode::InputPhoneNumberMatchesLocatedStateHistory,
                vec![Vendor::Idology],
            ),
        ];
        assert_have_same_elements(expected_codes, idology_reason_codes_with_info);
    }

    fn assert_have_same_elements<T>(l: Vec<T>, r: Vec<T>)
    where
        T: Eq + Debug + Clone,
    {
        if !(l.iter().all(|i| r.contains(i)) && r.iter().all(|i| l.contains(i)) && l.len() == r.len()) {
            panic!(
                "{}",
                format!("\nleft={:?} does not equal\nright={:?}\n", l.to_vec(), r.to_vec())
            )
        }
    }
}
