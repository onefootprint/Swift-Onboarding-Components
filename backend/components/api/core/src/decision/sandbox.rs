use std::collections::HashMap;

use crate::errors::ApiResult;
use db::models::verification_request::VerificationRequest;
use idv::{ParsedResponse, VendorResponse};
use newtypes::{DecisionStatus, FootprintReasonCode, SignalSeverity, VaultKind, Vendor, VendorAPI};
use rand::seq::SliceRandom;
use rand::Rng;
use strum::IntoEnumIterator;

use super::{
    engine::VendorResults,
    onboarding::{Decision, OnboardingRulesDecisionOutput},
    utils::FixtureDecision,
    Error,
};

// In future, this could take in FixtureDecision and determine the fixture vendor response to use.
// But its a little tricky because if the sandbox selection is "Review" or "Stepup" thats a function of rules not just the individual vendor responses
fn fixture_response_for_vendor_api(vendor_api: VendorAPI) -> ApiResult<VendorResponse> {
    match vendor_api {
        VendorAPI::IdologyExpectID => {
            let v = idv::test_fixtures::test_idology_expectid_response();
            Ok(VendorResponse {
                response: ParsedResponse::IDologyExpectID(serde_json::value::from_value(v.clone())?),
                raw_response: v.into(),
            })
        }
        VendorAPI::TwilioLookupV2 => {
            let v = idv::test_fixtures::test_twilio_lookupv2_response();
            Ok(VendorResponse {
                response: ParsedResponse::TwilioLookupV2(serde_json::value::from_value(v.clone())?),
                raw_response: v.into(),
            })
        }
        VendorAPI::SocureIDPlus => {
            let v = idv::test_fixtures::socure_idplus_fake_passing_response();
            Ok(VendorResponse {
                response: ParsedResponse::SocureIDPlus(serde_json::value::from_value(v.clone())?),
                raw_response: v.into(),
            })
        }
        VendorAPI::ExperianPreciseID => {
            let v = idv::test_fixtures::experian_cross_core_response();
            Ok(VendorResponse {
                response: ParsedResponse::ExperianPreciseID(serde_json::value::from_value(v.clone())?),
                raw_response: v.into(),
            })
        }
        v => Err(Error::FixtureDataNotFound(v).into()),
    }
}

pub fn get_fixture_vendor_results(vreqs: Vec<VerificationRequest>) -> ApiResult<VendorResults> {
    let fixture_responses = vreqs
        .into_iter()
        .map(|vreq| {
            let vr = fixture_response_for_vendor_api(vreq.vendor_api)?;
            Ok((vreq, vr))
        })
        .collect::<ApiResult<Vec<_>>>()?;

    Ok(VendorResults {
        successful: fixture_responses,
        non_critical_errors: vec![],
        critical_errors: vec![],
    })
}

pub fn get_fixture_reason_codes(
    fixture_decision: FixtureDecision,
    vault_kind: VaultKind,
) -> Vec<(FootprintReasonCode, Vec<Vendor>)> {
    let reason_code_map = build_reason_code_map(vault_kind);
    let (decision_status, create_manual_review) = fixture_decision;
    // Create some mock risk signals that are somewhat consistent with the mock decision
    let reason_codes: Vec<FootprintReasonCode> = match (decision_status, create_manual_review) {
        // Straight out rejection
        (DecisionStatus::Fail, false) => choose_random_reason_codes(reason_code_map, SignalSeverity::High, 3),
        // Manual review
        (DecisionStatus::Fail, true) => {
            choose_random_reason_codes(reason_code_map, SignalSeverity::Medium, 3)
        }
        // TODO: probably need to pass in Alpaca specific context here to get reason codes that make sense for that workflow
        (DecisionStatus::StepUp, _) => choose_random_reason_codes(reason_code_map, SignalSeverity::Medium, 3),
        // Approved
        (DecisionStatus::Pass, _) => choose_random_reason_codes(reason_code_map, SignalSeverity::Info, 4),
    };
    reason_codes
        .into_iter()
        .map(|r| (r, vec![Vendor::Idology]))
        .collect()
}

// For AlpacaKYC workflow, we want fixtures to be:
// #pass => KYC passes, no WL/AM hits (KYC reason_codes should just be strong matches)
// #manualreview => KYC passes but then there is a watchlist hit (KYC reason_codes should be strong matches)
// #stepup => KYC fails and there is no watchlist hit (KYC reason_code should be name/dob/address mismatch)
// #fail => KYC hard fails (KYC reason_code should be SSN does not match or something else catastrophic)
pub fn get_fixture_reason_codes_alpaca(
    fixture_decision: FixtureDecision,
) -> Vec<(FootprintReasonCode, Vec<Vendor>)> {
    let (decision_status, create_manual_review) = fixture_decision;
    let reason_codes: Vec<FootprintReasonCode> = match (decision_status, create_manual_review) {
        // #pass | #manualreview
        (DecisionStatus::Pass, _) | (DecisionStatus::Fail, true) => {
            // TODO: later could randomize some other innocuous reason codes here if we wanted
            vec![
                FootprintReasonCode::AddressMatches,
                FootprintReasonCode::DobMatches,
                FootprintReasonCode::SsnMatches,
                FootprintReasonCode::NameFirstMatches,
                FootprintReasonCode::NameLastMatches,
            ]
        }
        // #stepup
        (DecisionStatus::StepUp, _) => {
            let mismatch_reason_codes = vec![
                FootprintReasonCode::AddressDoesNotMatch,
                FootprintReasonCode::DobDoesNotMatch,
                FootprintReasonCode::NameFirstDoesNotMatch,
                FootprintReasonCode::NameLastDoesNotMatch,
            ];
            let rng = &mut rand::thread_rng();
            let n = rng.gen_range(0..=mismatch_reason_codes.len());
            mismatch_reason_codes.choose_multiple(rng, n).cloned().collect()
        }
        // #fail
        (DecisionStatus::Fail, false) => vec![FootprintReasonCode::SsnDoesNotMatch],
    };
    reason_codes
        .into_iter()
        .map(|r| (r, vec![Vendor::Idology]))
        .collect()
}

fn choose_random_reason_codes(
    reason_code_map: HashMap<SignalSeverity, Vec<FootprintReasonCode>>,
    severity: SignalSeverity,
    n: usize,
) -> Vec<FootprintReasonCode> {
    reason_code_map
        .get(&severity)
        .map(|frcs| {
            frcs.choose_multiple(&mut rand::thread_rng(), n)
                .cloned()
                .collect()
        })
        .unwrap_or_default()
}

fn build_reason_code_map(vault_kind: VaultKind) -> HashMap<SignalSeverity, Vec<FootprintReasonCode>> {
    FootprintReasonCode::iter()
        .filter_map(|rs| {
            if rs.scopes().iter().all(|s| match vault_kind {
                VaultKind::Person => s.is_for_person(),
                VaultKind::Business => !s.is_for_person(),
            }) {
                Some((rs.severity(), rs))
            } else {
                None
            }
        })
        .fold(HashMap::new(), |mut acc, (severity, frc)| {
            acc.entry(severity).or_default().push(frc);
            acc
        })
}

impl From<FixtureDecision> for OnboardingRulesDecisionOutput {
    fn from(value: FixtureDecision) -> Self {
        let (decision_status, create_manual_review) = value;
        OnboardingRulesDecisionOutput {
            decision: Decision {
                decision_status,
                should_commit: decision_status == DecisionStatus::Pass,
                create_manual_review,
            },
            rules_triggered: vec![],
            rules_not_triggered: vec![],
        }
    }
}

#[cfg(test)]
mod tests {
    use newtypes::{SignalSeverity, VaultKind};
    use test_case::test_case;

    use super::{build_reason_code_map, choose_random_reason_codes};

    #[test_case(1, SignalSeverity::High => 1)]
    #[test_case(3, SignalSeverity::Info => 3)]
    #[test_case(2, SignalSeverity::Medium => 2)]
    fn test_choose_random_reason_codes(n: usize, severity: SignalSeverity) -> usize {
        let rc = build_reason_code_map(VaultKind::Person);
        let result = choose_random_reason_codes(rc, severity.clone(), n);

        assert!(result.iter().all(|r| r.severity() == severity));

        result.len()
    }
}
