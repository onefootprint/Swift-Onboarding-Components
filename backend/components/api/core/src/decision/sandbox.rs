use std::collections::HashMap;

use crate::{errors::ApiResult, utils::vault_wrapper::VaultWrapper};
use db::{
    models::{
        decision_intent::DecisionIntent, ob_configuration::ObConfiguration, vault::Vault,
        verification_request::VerificationRequest, verification_result::VerificationResult,
        workflow::Workflow,
    },
    DbPool,
};
use idv::{ParsedResponse, VendorResponse};
use newtypes::{
    DecisionIntentId, DecisionStatus, FootprintReasonCode, ScopedVaultId, SignalSeverity, VaultKind,
    VaultPublicKey, VendorAPI,
};
use rand::seq::SliceRandom;
use rand::Rng;
use strum::IntoEnumIterator;

use super::{
    features,
    onboarding::{Decision, OnboardingRulesDecisionOutput},
    utils::FixtureDecision,
    vendor::{self, vendor_result::VendorResult},
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

pub async fn save_fixture_vendor_result(
    db_pool: &DbPool,
    di: &DecisionIntent,
    wf: &Workflow,
) -> ApiResult<VendorResult> {
    let di_id = di.id.clone();
    let sv_id = wf.scoped_vault_id.clone();
    db_pool
        .db_query(move |conn| {
            let uv = Vault::get(conn, &sv_id)?;
            let vr = fixture_response_for_vendor_api(VendorAPI::IdologyExpectID)?;
            let (vreq, vres) = vendor::verification_result::save_vreq_and_vres(
                conn,
                &uv.public_key,
                &sv_id,
                &di_id,
                Ok(vr.clone()),
            )?;

            Ok(VendorResult {
                response: vr,
                verification_result_id: vres.id,
                verification_request_id: vreq.id,
            })
        })
        .await?
}

pub fn get_fixture_reason_codes(
    fixture_decision: FixtureDecision,
    vault_kind: VaultKind,
    vw_obc: Option<(&VaultWrapper, &ObConfiguration)>,
) -> Vec<(FootprintReasonCode, VendorAPI)> {
    let reason_code_map = build_reason_code_map(vault_kind);
    let (decision_status, create_manual_review) = fixture_decision;

    let vendor_api = match vault_kind {
        VaultKind::Person => VendorAPI::IdologyExpectID,
        VaultKind::Business => VendorAPI::MiddeskBusinessUpdateWebhook,
    };

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

    // Still create the expected user input based risk signals to make the Sandbox experience as fun and lifelike as possible for the eager Tenant-to-be
    let user_input_risk_signals = if let Some((vw, obc)) = vw_obc {
        features::risk_signals::user_input_based_risk_signals(vw, obc)
    } else {
        vec![]
    };
    reason_codes
        .into_iter()
        .chain(user_input_risk_signals.into_iter())
        .map(|r| (r, vendor_api))
        .collect()
}

// For AlpacaKYC workflow, we want fixtures to be:
// #pass => KYC passes, no WL/AM hits (KYC reason_codes should just be strong matches)
// #manualreview => KYC passes but then there is a watchlist hit (KYC reason_codes should be strong matches)
// #stepup => KYC fails and there is no watchlist hit (KYC reason_code should be name/dob/address mismatch)
// #fail => KYC hard fails (KYC reason_code should be SSN does not match or something else catastrophic)
pub fn get_fixture_reason_codes_alpaca(
    fixture_decision: FixtureDecision,
    vw: &VaultWrapper,
    obc: &ObConfiguration,
) -> Vec<(FootprintReasonCode, VendorAPI)> {
    let (decision_status, create_manual_review) = fixture_decision;
    let reason_codes: Vec<FootprintReasonCode> = match (decision_status, create_manual_review) {
        // #pass | #manualreview
        (DecisionStatus::Pass, _) | (DecisionStatus::Fail, true) => {
            // TODO: later could randomize some other innocuous reason codes here if we wanted
            vec![
                FootprintReasonCode::AddressMatches,
                FootprintReasonCode::DobMatches,
                FootprintReasonCode::SsnMatches,
                FootprintReasonCode::NameMatches,
            ]
        }
        // #stepup
        (DecisionStatus::StepUp, _) => {
            let mismatch_reason_codes = vec![
                FootprintReasonCode::AddressDoesNotMatch,
                FootprintReasonCode::DobDoesNotMatch,
                FootprintReasonCode::NameMatches,
            ];
            let rng = &mut rand::thread_rng();
            let n = rng.gen_range(0..=mismatch_reason_codes.len());
            mismatch_reason_codes
                .choose_multiple(rng, n)
                .cloned()
                .chain(vec![FootprintReasonCode::SsnMatches])
                .collect()
        }
        // #fail
        (DecisionStatus::Fail, false) => vec![FootprintReasonCode::SsnDoesNotMatch],
    };

    let user_input_risk_signals = features::risk_signals::user_input_based_risk_signals(vw, obc);

    reason_codes
        .into_iter()
        .chain(user_input_risk_signals.into_iter())
        .map(|r| (r, VendorAPI::IdologyExpectID))
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
                // not used
                vendor_api: VendorAPI::IdologyExpectID,
            },
            rules_triggered: vec![],
            rules_not_triggered: vec![],
        }
    }
}

fn incode_watchlist_result_response_for_fixture(fixture_decision: FixtureDecision) -> serde_json::Value {
    match fixture_decision {
        // #manualreview
        (newtypes::DecisionStatus::Fail, true) => {
            idv::test_fixtures::incode_watchlist_result_response_yes_hits()
        }
        _ => idv::test_fixtures::incode_watchlist_result_response_no_hits(),
    }
}

pub async fn save_fixture_incode_watchlist_result(
    db_pool: &DbPool,
    fixture_decision: FixtureDecision,
    di_id: &DecisionIntentId,
    sv_id: &ScopedVaultId,
    vault_public_key: &VaultPublicKey,
) -> ApiResult<VerificationResult> {
    let raw = incode_watchlist_result_response_for_fixture(fixture_decision);

    let di_id = di_id.clone();
    let sv_id = sv_id.clone();
    let vault_public_key = vault_public_key.clone();
    let vres = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let vreq = VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeWatchlistCheck)?;
            let e_response = vendor::verification_result::encrypt_verification_result_response(
                &raw.clone().into(),
                &vault_public_key,
            )?;
            let vres = VerificationResult::create(conn, vreq.id, raw.into(), e_response, false)?;
            Ok(vres)
        })
        .await?;

    Ok(vres)
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
