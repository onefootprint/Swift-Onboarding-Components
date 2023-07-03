use crate::decision::{
    onboarding::{Decision, DecisionReasonCodes},
    rule::{
        rule_set::{Action, RuleSet},
        rules_engine::OnboardingEvaluationResult,
    },
    Error, RuleError,
};
/// This module is for taking parsed responses from vendors and transforming them into a FeatureVector
/// we can use to make decisions
use idv::ParsedResponse;
use itertools::Itertools;
use newtypes::{DecisionStatus, FootprintReasonCode, VendorAPI, VerificationResultId};
use strum::IntoEnumIterator;

use crate::{
    decision::{
        onboarding::{FeatureVector, OnboardingRulesDecisionOutput},
        rule::{self, rule_sets, RuleName},
        vendor::vendor_result::VendorResult,
    },
    errors::ApiResult,
};

use super::{
    experian::ExperianFeatures, idology_expectid::IDologyFeatures,
    idology_scan_onboarding::IDologyScanOnboardingFeatures, socure_idplus::SocureFeatures,
    waterfall_logic::get_kyc_rules_result,
};

// TODO!
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct TwilioFeatures {}

#[derive(Clone, Default, Debug)]
pub struct KycFeatureVector {
    pub idology_features: Option<IDologyFeatures>,
    pub idology_scan_onboarding_features: Option<IDologyScanOnboardingFeatures>,
    pub twilio_features: Option<TwilioFeatures>,
    pub socure_features: Option<SocureFeatures>,
    pub experian_features: Option<ExperianFeatures>,
}

impl KycFeatureVector {
    // The assumption (which is fine for now) is that we compute features from list of vendor responses
    // that are unique by vendor. So we "aggregate" by:
    //    Vec<VendorResponse> ---map--> Vec<FeatureVector> --reduce--> FeatureVector by merging optional fields
    // Every FeatureVector in the Vec<FeatureVector> should have only a single field non-optional
    fn merge(self, other: KycFeatureVector) -> Self {
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

impl KycFeatureVector {
    fn reason_codes_for_vendor_api(
        &self,
        vendor_api: &VendorAPI,
    ) -> Option<(VerificationResultId, Vec<FootprintReasonCode>)> {
        match vendor_api {
            VendorAPI::IdologyExpectID => self.idology_features.as_ref().map(|i| {
                (
                    i.verification_result_id.clone(),
                    Self::enrich_idology_reason_codes_with_info_codes(i.footprint_reason_codes.clone()),
                )
            }),
            VendorAPI::IdologyScanVerifySubmission => None,
            VendorAPI::IdologyScanVerifyResults => None,
            VendorAPI::IdologyScanOnboarding => None,
            VendorAPI::TwilioLookupV2 => None,
            VendorAPI::ExperianPreciseID => self
                .experian_features
                .as_ref()
                .map(|f| (f.verification_result_id.clone(), f.footprint_reason_codes.clone())),
            VendorAPI::SocureIDPlus => self
                .socure_features
                .as_ref()
                .map(|f| (f.verification_result_id.clone(), f.footprint_reason_codes.clone())),
            VendorAPI::IdologyPa => None,
            VendorAPI::MiddeskCreateBusiness => None,
            VendorAPI::MiddeskBusinessUpdateWebhook => None,
            VendorAPI::MiddeskTinRetriedWebhook => None,
            VendorAPI::MiddeskGetBusiness => None,
            VendorAPI::IncodeStartOnboarding => None,
            VendorAPI::IncodeAddFront => None,
            VendorAPI::IncodeAddBack => None,
            VendorAPI::IncodeProcessId => None,
            VendorAPI::IncodeFetchScores => None,
            VendorAPI::IncodeAddPrivacyConsent => None,
            VendorAPI::IncodeAddMLConsent => None,
            VendorAPI::IncodeFetchOCR => None,
            VendorAPI::IncodeAddSelfie => None,
            // TODO!
            VendorAPI::IncodeWatchlistCheck => None,
            VendorAPI::IncodeGetOnboardingStatus => None,
            VendorAPI::IncodeProcessFace => None,
        }
    }

    /// Based on the set of computed reason codes, add in `Info` codes for idology.
    /// Other vendors might require different logic
    fn enrich_idology_reason_codes_with_info_codes(
        mut reason_codes: Vec<FootprintReasonCode>,
    ) -> Vec<FootprintReasonCode> {
        // Add in info codes ONLY if we've located the identity
        if !(reason_codes.contains(&FootprintReasonCode::IdNotLocated)
            // Idology considers this a "restricted match" and doesn't return additional qualifiers so 
            // we shouldn't infer anything about "info" codes here
            || reason_codes.contains(&FootprintReasonCode::DobLocatedCoppaAlert))
        {
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

    /// For now, we have very simple logic to decide when to commit which is just "if the only thing that failed this user is a watchlist hit, commit"
    ///
    /// More thoughts: https://www.notion.so/onefootprint/Design-Doc-Portabilization-Decision-71f1cfb945234c58b74e97f005211917?pvs=4
    pub fn should_commit(rules_triggered: &Vec<RuleName>) -> bool {
        rules_triggered.is_empty()
            || (rules_triggered.len() == 1 && rules_triggered.contains(&RuleName::WatchlistHit))
    }

    pub fn reason_codes(&self, vendor_apis: Vec<VendorAPI>) -> DecisionReasonCodes {
        vendor_apis
            .iter()
            .flat_map(|v| {
                self.reason_codes_for_vendor_api(v).map(|(vres_id, rcs)| {
                    rcs.iter()
                        .map(|rc: &FootprintReasonCode| (rc.to_owned(), v.to_owned(), vres_id.clone()))
                        .collect::<DecisionReasonCodes>()
                })
            })
            .flatten()
            .unique()
            .collect()
    }
}

impl TryFrom<VendorResult> for KycFeatureVector {
    type Error = crate::decision::Error;
    fn try_from(result: VendorResult) -> Result<Self, Error> {
        let response = result.response;
        let verification_result_id = result.verification_result_id;
        match response.response {
            ParsedResponse::IDologyExpectID(resp) => Ok(Self {
                idology_features: Some(IDologyFeatures::from(resp, verification_result_id)),
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: None,
                experian_features: None,
            }),
            // TODO!
            ParsedResponse::TwilioLookupV2(_) => Ok(Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: Some(TwilioFeatures {}),
                socure_features: None,
                experian_features: None,
            }),
            ParsedResponse::SocureIDPlus(ref idplus_response) => Ok(Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: Some(SocureFeatures::from(idplus_response, verification_result_id)),
                experian_features: None,
            }),
            // TODO
            ParsedResponse::IDologyScanVerifySubmission(_) => Ok(Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: None,
                experian_features: None,
            }),

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
            ParsedResponse::IDologyScanOnboarding(ref scan_ob_resp) => Ok(Self {
                idology_features: None,
                idology_scan_onboarding_features: Some(IDologyScanOnboardingFeatures::from(scan_ob_resp)),
                twilio_features: None,
                socure_features: None,
                experian_features: None,
            }),
            ParsedResponse::ExperianPreciseID(resp) => Ok(Self {
                idology_features: None,
                idology_scan_onboarding_features: None,
                twilio_features: None,
                socure_features: None,
                experian_features: Some(ExperianFeatures::from(resp, verification_result_id)),
            }),
            _ => Err(Error::KycFeatureVectorConversionError(verification_result_id)),
        }
    }
}

// From an array of VendorResponses, create our FeatureVector
// 2022-10-15: This won't be the way we do this forever, but let's start here and revisit as we have a better idea on how we want
//   to aggregate and compute features. once we have more complex features and scoring (aggregations/models and so on) we'll likely want a separate
//   risk features/scoring service
#[tracing::instrument(skip_all)]
pub fn create_features(results: Vec<VendorResult>) -> KycFeatureVector {
    let base_features = KycFeatureVector::default();

    results.into_iter().fold(base_features, |acc, v| {
        if let Ok(fv) = KycFeatureVector::try_from(v) {
            // ensures we don't error if VendorResult's are given that we don't have in KycFeatureVector yet
            acc.merge(fv)
        } else {
            acc
        }
    })
}

impl FeatureVector for KycFeatureVector {
    fn evaluate(&self) -> ApiResult<(OnboardingRulesDecisionOutput, DecisionReasonCodes)> {
        // The set of rules that determine if a user passes onboarding
        let idology_rules: Vec<RuleSet<IDologyFeatures>> = vec![rule_sets::kyc::idology_rule_set()];
        let experian_rules: Vec<RuleSet<ExperianFeatures>> = vec![rule_sets::kyc::experian_rule_set()];

        // Evaluate rules
        let idology_rule_result = self
            .idology_features
            .as_ref()
            .map(|f| rule::rules_engine::evaluate_onboarding_rules(idology_rules, f));

        // TODO: add in experian once we have rules for them
        self.experian_features
            .as_ref()
            .map(|e| rule::rules_engine::evaluate_onboarding_rules(experian_rules, e));

        // TODO: add experian in here
        // TODO: add Ord so we have a vendor preference
        let rule_results: Vec<OnboardingEvaluationResult> =
            vec![idology_rule_result].into_iter().flatten().collect();
        if rule_results.is_empty() {
            Err(crate::decision::Error::from(RuleError::MissingInputForRules))?;
        }

        // TODO: move reason code creation and use returned VendorAPI

        let result = get_kyc_rules_result(rule_results).map_err(Error::from)?;
        // If we no rules that triggered, we consider that a pass
        let decision_status = match result.triggered_action.as_ref() {
            Some(a) => match a {
                Action::StepUp => DecisionStatus::Fail,
                Action::ManualReview => DecisionStatus::Fail,
                Action::Fail => DecisionStatus::Fail,
            },
            None => DecisionStatus::Pass,
        };

        // For now, we just queue up failures so we can see until we have a better sense of
        // what reviews we want to be doing
        let create_manual_review = decision_status == DecisionStatus::Fail;

        // TODO: derive this better
        let reason_codes = self.reason_codes(vec![VendorAPI::TwilioLookupV2, result.vendor_api]);

        let output = OnboardingRulesDecisionOutput {
            decision: Decision {
                should_commit: Self::should_commit(&result.rules_triggered),
                decision_status,
                create_manual_review,
            },
            rules_triggered: result.rules_triggered.to_owned(),
            rules_not_triggered: result.rules_not_triggered.to_owned(),
        };
        Ok((output, reason_codes))
    }
}

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests {
    use db::test_helpers::assert_have_same_elements;
    use std::str::FromStr;

    use crate::decision::features::socure_idplus::SocureBaselineIdPlusLogicV6Result;

    use super::*;
    use idv::{
        idology::error::Error as IdologyError,
        idology::expectid::response::{self as idology_verification, ExpectIDResponse},
        socure::response::SocureIDPlusResponse,
        ParsedResponse, VendorResponse,
    };
    use newtypes::{DecisionStatus, VerificationRequestId, VerificationResultId};
    use serde_json::json;
    // Feature tests
    // TODO: add in twilio
    // My concern is that these test asserts require `Debug` trait to be derived. Will this work
    // for results that contain PII? I think this is a trickier problem, hence will do this for now
    #[test]
    fn test_features() -> Result<(), IdologyError> {
        let idology_result = create_idology_vendor_result("id.success")?;
        let vres_id = idology_result.verification_result_id.clone();
        let vendor_results = vec![idology_result];

        let feature_vector = create_features(vendor_results);
        let expected_idology_features = IDologyFeatures {
            footprint_reason_codes: vec![
                FootprintReasonCode::IpNotLocated,
                FootprintReasonCode::AddressStreetNameDoesNotMatch,
                FootprintReasonCode::WatchlistHitOfac,
                FootprintReasonCode::AddressPartiallyMatches,
                FootprintReasonCode::DobMatches,
                FootprintReasonCode::SsnMatches,
                FootprintReasonCode::NameMatches,
            ],
            verification_result_id: vres_id,
        };
        let expected_feature_vector = KycFeatureVector {
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
        let id_vres_id = VerificationResultId::from_str("vres123").unwrap();
        let socure_vres_id = VerificationResultId::from_str("vres456").unwrap();
        let feature_vector = KycFeatureVector {
            idology_features: Some(IDologyFeatures {
                footprint_reason_codes: vec![
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::NameLastDoesNotMatch,
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::IdNotLocated,
                ],
                verification_result_id: id_vres_id.clone(),
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
                reason_codes: vec![],
                footprint_reason_codes: vec![
                    FootprintReasonCode::SsnIssuedPriorToDob,
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::SsnIssuedPriorToDob,
                ],
                verification_result_id: socure_vres_id.clone(),
            }),
            experian_features: None,
        };
        // no output when no input VendorAPI's are specified
        assert_eq!(0, feature_vector.reason_codes(vec![]).len());
        // only reason codes from specified VendorAPI's are included in output
        assert_have_same_elements(
            vec![
                (
                    FootprintReasonCode::SubjectDeceased,
                    VendorAPI::IdologyExpectID,
                    id_vres_id.clone(),
                ),
                (
                    FootprintReasonCode::NameLastDoesNotMatch,
                    VendorAPI::IdologyExpectID,
                    id_vres_id.clone(),
                ),
                (
                    FootprintReasonCode::IdNotLocated,
                    VendorAPI::IdologyExpectID,
                    id_vres_id.clone(),
                ),
            ],
            feature_vector.reason_codes(vec![VendorAPI::IdologyExpectID]),
        );

        let yo = feature_vector.reason_codes(vec![VendorAPI::IdologyExpectID, VendorAPI::SocureIDPlus]);
        // correctly consolidates by vendor
        assert_have_same_elements(
            vec![
                (
                    FootprintReasonCode::SubjectDeceased,
                    VendorAPI::IdologyExpectID,
                    id_vres_id.clone(),
                ),
                (
                    FootprintReasonCode::SubjectDeceased,
                    VendorAPI::SocureIDPlus,
                    socure_vres_id.clone(),
                ),
                (
                    FootprintReasonCode::NameLastDoesNotMatch,
                    VendorAPI::IdologyExpectID,
                    id_vres_id.clone(),
                ),
                (
                    FootprintReasonCode::SsnIssuedPriorToDob,
                    VendorAPI::SocureIDPlus,
                    socure_vres_id,
                ),
                (
                    FootprintReasonCode::IdNotLocated,
                    VendorAPI::IdologyExpectID,
                    id_vres_id.clone(),
                ),
            ],
            yo,
        );

        // Info codes
        let feature_vector_id_located = KycFeatureVector {
            idology_features: Some(IDologyFeatures {
                footprint_reason_codes: vec![
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::NameLastDoesNotMatch,
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::IpStateDoesNotMatch,
                ],
                verification_result_id: id_vres_id.clone(),
            }),
            ..Default::default()
        };

        let idology_reason_codes_with_info =
            feature_vector_id_located.reason_codes(vec![VendorAPI::IdologyExpectID]);
        let expected_codes = vec![
            (
                FootprintReasonCode::SubjectDeceased,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            // Note: the last name and IpState do not match, so they do NOT appear as info reason codes
            (
                FootprintReasonCode::NameLastDoesNotMatch,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::IpStateDoesNotMatch,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            // All other info codes present, though
            (
                FootprintReasonCode::AddressMatches,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::AddressZipCodeMatches,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::AddressStreetNameMatches,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::AddressStreetNumberMatches,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::AddressStateMatches,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::DobYobMatches,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::DobMobMatches,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::SsnMatches,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::PhoneNumberMatches,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::InputPhoneNumberMatchesInputState,
                VendorAPI::IdologyExpectID,
                id_vres_id.clone(),
            ),
            (
                FootprintReasonCode::InputPhoneNumberMatchesLocatedStateHistory,
                VendorAPI::IdologyExpectID,
                id_vres_id,
            ),
        ];
        assert_have_same_elements(expected_codes, idology_reason_codes_with_info);
    }
}
