use super::vendor::vendor_result::VendorResult;
use super::vendor::{
    self,
};
use super::Error;
use crate::decision::vendor::neuro_id::save_neuro_event;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::FpResult;
use crate::State;
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::models::workflow::Workflow;
use db::DbPool;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::neuro_id::response::NeuroAPIResult;
use idv::neuro_id::response::NeuroApiResponse;
use idv::neuro_id::response::NeuroIdAnalyticsResponse;
use idv::test_fixtures::NeuroTestOpts;
use idv::ParsedResponse;
use idv::VendorResponse;
use newtypes::CipKind;
use newtypes::DecisionIntentId;
use newtypes::DecisionStatus;
use newtypes::FootprintReasonCode;
use newtypes::NeuroIdentityId;
use newtypes::ScopedVaultId;
use newtypes::SignalSeverity;
use newtypes::TenantId;
use newtypes::VaultKind;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowId;
use rand::seq::SliceRandom;
use rand::Rng;
use std::collections::HashMap;
use strum::IntoEnumIterator;

// In future, this could take in WorkflowFixtureResult and determine the fixture vendor response to
// use. But its a little tricky because if the sandbox selection is "Review" or "Stepup" thats a
// function of rules not just the individual vendor responses
fn fixture_response_for_vendor_api(vendor_api: VendorAPI) -> FpResult<VendorResponse> {
    match vendor_api {
        VendorAPI::IdologyExpectId => {
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
        VendorAPI::SocureIdPlus => {
            let v = idv::test_fixtures::socure_idplus_fake_passing_response();
            Ok(VendorResponse {
                response: ParsedResponse::SocureIDPlus(serde_json::value::from_value(v.clone())?),
                raw_response: v.into(),
            })
        }
        VendorAPI::ExperianPreciseId => {
            let v = idv::test_fixtures::experian_cross_core_response(None, None);
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
) -> FpResult<VendorResult> {
    let di_id = di.id.clone();
    let sv_id = wf.scoped_vault_id.clone();
    db_pool
        .db_query(move |conn| {
            let uv = Vault::get(conn, &sv_id)?;
            let vr = fixture_response_for_vendor_api(VendorAPI::IdologyExpectId)?;
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
        .await
}

// TODO: get_fixture_kyb_reason_codes
pub fn get_fixture_kyb_reason_codes(
    fixture_result: WorkflowFixtureResult,
) -> Vec<(FootprintReasonCode, VendorAPI)> {
    make_random_kyc_reason_codes_for_fixture_decision(fixture_result, VaultKind::Business)
        .into_iter()
        .map(|r| (r, VendorAPI::MiddeskBusinessUpdateWebhook))
        .collect()
}

pub fn get_fixture_kyc_reason_codes(
    fixture_result: WorkflowFixtureResult,
    obc: &ObConfiguration,
) -> Vec<(FootprintReasonCode, VendorAPI)> {
    match obc.cip_kind {
        // We produce specific fixtures for Alpaca to better simulate the 3 canonical use cases that Alpaca
        // always asks for
        Some(CipKind::Alpaca) => get_fixture_reason_codes_alpaca(fixture_result),
        // For non-alpaca cases, we just produce an assortment of reasonable random risk signals
        Some(CipKind::Apex) | None => {
            let reason_codes =
                make_random_kyc_reason_codes_for_fixture_decision(fixture_result, VaultKind::Person);

            reason_codes
                .into_iter()
                .map(|r| (r, VendorAPI::IdologyExpectId))
                .collect()
        }
    }
}

pub fn make_random_kyc_reason_codes_for_fixture_decision(
    fixture_result: WorkflowFixtureResult,
    vault_kind: VaultKind,
) -> Vec<FootprintReasonCode> {
    let reason_code_map = build_reason_code_map(vault_kind);

    // Create some mock risk signals that are somewhat consistent with the mock decision
    match fixture_result.decision_status() {
        // Straight out rejection
        (DecisionStatus::Fail, false) => choose_random_reason_codes(reason_code_map, SignalSeverity::High, 3),
        // Manual review
        (DecisionStatus::Fail, true) => {
            choose_random_reason_codes(reason_code_map, SignalSeverity::Medium, 3)
        }
        // TODO: probably need to pass in Alpaca specific context here to get reason codes that make sense for
        // that workflow
        (DecisionStatus::StepUp, _) => choose_random_reason_codes(reason_code_map, SignalSeverity::Medium, 3),
        // Approved
        (DecisionStatus::Pass, _) => choose_random_reason_codes(reason_code_map, SignalSeverity::Info, 4),
        (DecisionStatus::None, _) => vec![],
    }
}

// For AlpacaKYC workflow, we want fixtures to be:
// #pass => KYC passes, no WL/AM hits (KYC reason_codes should just be strong matches)
// #manualreview => KYC passes but then there is a watchlist hit (KYC reason_codes should be strong
// matches) #stepup => KYC fails and there is no watchlist hit (KYC reason_code should be
// name/dob/address mismatch) #fail => KYC hard fails (KYC reason_code should be SSN does not match
// or something else catastrophic)
pub fn get_fixture_reason_codes_alpaca(
    fixture_result: WorkflowFixtureResult,
) -> Vec<(FootprintReasonCode, VendorAPI)> {
    let reason_codes = match fixture_result.decision_status() {
        // #pass | #manualreview
        (DecisionStatus::Pass, _) | (DecisionStatus::Fail, true) | (DecisionStatus::None, _) => {
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
            let mismatch_reason_codes = [
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

    reason_codes
        .into_iter()
        .map(|r| (r, VendorAPI::IdologyExpectId))
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
            if rs.to_be_deprecated() {
                None
            } else if rs.scopes().iter().all(|s| match vault_kind {
                VaultKind::Person => s.is_for_person() && s.is_for_kyc(),
                VaultKind::Business => !s.is_for_person() && s.is_for_kyb(),
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

pub fn get_fixture_aml_reason_codes(
    fixture_result: &WorkflowFixtureResult,
    obc: &ObConfiguration,
) -> Vec<(FootprintReasonCode, VendorAPI)> {
    match obc.cip_kind {
        // For Alpaca, for the manual_review fixture, we want to simulate a watchlist hit
        Some(CipKind::Alpaca) => match fixture_result.decision_status() {
            (DecisionStatus::Fail, true) => vec![
                (
                    FootprintReasonCode::WatchlistHitOfac,
                    VendorAPI::IncodeWatchlistCheck,
                ),
                (
                    FootprintReasonCode::AdverseMediaHit,
                    VendorAPI::IncodeWatchlistCheck,
                ),
            ],
            _ => vec![],
        },
        // For non-alpaca cases, we don't really currently provide a way to fixture watchlist hits in
        // particular
        _ => {
            vec![]
        }
    }
}

fn incode_watchlist_result_response_for_fixture(fixture_result: WorkflowFixtureResult) -> serde_json::Value {
    match fixture_result.decision_status() {
        // #manualreview
        (newtypes::DecisionStatus::Fail, true) => {
            idv::test_fixtures::incode_watchlist_result_response_yes_hits()
        }
        _ => idv::test_fixtures::incode_watchlist_result_response_no_hits(),
    }
}

pub async fn save_fixture_incode_watchlist_result(
    db_pool: &DbPool,
    fixture_result: WorkflowFixtureResult,
    di_id: &DecisionIntentId,
    sv_id: &ScopedVaultId,
    vault_public_key: &VaultPublicKey,
) -> FpResult<(VerificationResult, WatchlistResultResponse)> {
    let raw = incode_watchlist_result_response_for_fixture(fixture_result);
    let parsed = serde_json::from_value::<WatchlistResultResponse>(raw.clone())?;

    let di_id = di_id.clone();
    let sv_id = sv_id.clone();
    let vault_public_key = vault_public_key.clone();
    let vres = db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let vreq =
                VerificationRequest::create(conn, (&sv_id, &di_id, VendorAPI::IncodeWatchlistCheck).into())?;
            let e_response = vendor::verification_result::encrypt_verification_result_response(
                &raw.clone().into(),
                &vault_public_key,
            )?;
            let vres = VerificationResult::create(conn, vreq.id, raw.into(), e_response, false)?;
            Ok(vres)
        })
        .await?;

    Ok((vres, parsed))
}

pub async fn save_fixture_neuro_result(
    state: &State,
    fixture_result: WorkflowFixtureResult,
    di_id: &DecisionIntentId,
    sv_id: &ScopedVaultId,
    wf_id: &WorkflowId,
    t_id: &TenantId,
    vault_public_key: &VaultPublicKey,
) -> FpResult<VendorResult> {
    let raw = match fixture_result {
        WorkflowFixtureResult::Fail => {
            let opts = NeuroTestOpts {
                automated_activity: true,
                factory_reset: true,
                fraud_ring_indicator: true,
                bot_framework: true,
                device_id: None,
                cookie_id: None,
            };
            idv::test_fixtures::neuro_id_success_response(opts)
        }
        WorkflowFixtureResult::Pass
        | WorkflowFixtureResult::ManualReview
        | WorkflowFixtureResult::StepUp
        | WorkflowFixtureResult::UseRulesOutcome => {
            idv::test_fixtures::neuro_id_success_response(NeuroTestOpts::default())
        }
    };

    let parsed = serde_json::from_value::<NeuroIdAnalyticsResponse>(raw.clone())?;
    let request_result = Ok(NeuroApiResponse {
        result: NeuroAPIResult::Success(parsed.clone()),
        raw_response: raw.clone().into(),
    });

    let args = SaveVerificationResultArgs::new_for_neuro(
        &request_result,
        di_id.clone(),
        sv_id.clone(),
        vault_public_key.clone(),
    );

    let (vres_id, vreq_id) = args.save(&state.db_pool).await?;
    let vendor_response = VendorResponse {
        response: ParsedResponse::NeuroIdAnalytics(parsed.clone()),
        raw_response: raw.into(),
    };

    let neuro_id = NeuroIdentityId::from(wf_id.clone());
    save_neuro_event(state, &parsed, t_id, neuro_id, sv_id, wf_id, &vres_id).await?;
    Ok(VendorResult {
        response: vendor_response,
        verification_result_id: vres_id,
        verification_request_id: vreq_id,
    })
}

#[cfg(test)]
mod tests {
    use super::build_reason_code_map;
    use super::choose_random_reason_codes;
    use newtypes::SignalScope;
    use newtypes::SignalSeverity;
    use newtypes::VaultKind;
    use test_case::test_case;

    #[test_case(3, SignalSeverity::High => 3)]
    #[test_case(10, SignalSeverity::Info => 10)]
    #[test_case(20, SignalSeverity::Medium => 20)]
    fn test_choose_random_reason_codes(n: usize, severity: SignalSeverity) -> usize {
        let rc = build_reason_code_map(VaultKind::Person);
        let result = choose_random_reason_codes(rc, severity.clone(), n);

        assert!(result.iter().all(|r| r.severity() == severity
            // relying on test flaking for a failure kinda is lame, but its not a big enough deal to completely refactor to isolate this for testing
            && ![SignalScope::Document, SignalScope::Device].contains(&r.scope().unwrap())));

        result.len()
    }
}
