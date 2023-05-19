use std::collections::HashMap;

use db::{
    models::{
        decision_intent::DecisionIntent,
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::RiskSignal,
        verification_request::VerificationRequest,
        verification_result::VerificationResult,
    },
    PgConn,
};
use newtypes::{
    DbActor, DecisionIntentId, DecisionStatus, FootprintReasonCode, IdentityDocumentId, OnboardingId,
    PhoneNumber, ScopedVaultId, SignalSeverity, TenantId, Vendor, VendorAPI,
};
use rand::seq::SliceRandom;
use strum::IntoEnumIterator;

use super::vendor;
use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    utils::vault_wrapper::{Person, VaultWrapper, VwArgs},
    State,
};
use feature_flag::{BoolFlag, FeatureFlagClient};

type CreateManualReview = bool;
type FixtureDecision = (DecisionStatus, CreateManualReview);

#[tracing::instrument(skip_all)]
/// Determines whether production IDV requests should be made.
/// Returns None if we should make production IDV reqs, otherwise returns Some with the desired
/// fixture status
pub async fn get_fixture_data_decision(
    state: &State,
    ff_client: &impl FeatureFlagClient, // Pass in ff_client directly to make it easier to test
    scoped_vault_id: &ScopedVaultId,
    tenant_id: &TenantId,
) -> ApiResult<Option<FixtureDecision>> {
    let svid = scoped_vault_id.clone();
    let uvw: VaultWrapper<Person> = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build(conn, VwArgs::Tenant(&svid)))
        .await??;

    let is_sandbox = !uvw.vault.is_live;
    if is_sandbox {
        // Sandbox users have the final KYC state encoded in their phone number's sandbox suffix
        let phone_number = uvw.get_decrypted_primary_phone(state).await?;
        let fixture_decision = decision_status_from_sandbox_suffix(phone_number);
        return Ok(Some(fixture_decision));
    }

    let is_demo_tenant = ff_client.flag(BoolFlag::IsDemoTenant(tenant_id));
    if is_demo_tenant {
        // For our tenant we use for demos, always make a fixture pass
        let fixture_decision = (DecisionStatus::Pass, false);
        Ok(Some(fixture_decision))
    } else {
        // If this is a prod user vault, we always send prod requests
        // In order to create production UVs, customers need us to flip a bit for them in PG on `tenant` (sandbox_restricted -> false)
        Ok(None)
    }
}

/// Helper to do some sanity checks when creating document verification requests
pub fn create_document_verification_request(
    conn: &mut PgConn,
    vendor_api: VendorAPI,
    scoped_user_id: ScopedVaultId,
    identity_document_id: IdentityDocumentId,
    decision_intent_id: &DecisionIntentId,
) -> Result<VerificationRequest, ApiError> {
    // As of now, we only support 1 vendor for sending documents too
    if vendor_api != VendorAPI::IdologyScanOnboarding {
        let msg = format!("cannot send document request to {}", vendor_api);
        return Err(ApiError::AssertionError(msg));
    }

    VerificationRequest::create_document_verification_request(
        conn,
        vendor_api,
        scoped_user_id,
        identity_document_id,
        decision_intent_id,
    )
    .map_err(ApiError::from)
}

// If socure fails, we shouldn't fail the DE run
pub fn should_throw_error_in_decision_engine_if_error_in_request(vendor_api: &VendorAPI) -> bool {
    // Socure plus and Experian isn't used by anyone except Footprint (at this time)
    !matches!(vendor_api, VendorAPI::SocureIDPlus | VendorAPI::ExperianPreciseID)
}

pub fn decision_status_from_sandbox_suffix(phone_number: PhoneNumber) -> FixtureDecision {
    if phone_number.sandbox_suffix.starts_with("fail") {
        (DecisionStatus::Fail, false)
    } else if phone_number.sandbox_suffix.starts_with("manualreview") {
        (DecisionStatus::Fail, true)
    } else {
        (DecisionStatus::Pass, false)
    }
}

#[tracing::instrument(skip_all)]
pub async fn setup_test_fixtures(
    state: &State,
    ob_id: OnboardingId,
    biz_ob: Option<Onboarding>,
    fixture_decision: FixtureDecision,
) -> ApiResult<()> {
    let (decision_status, create_manual_review) = fixture_decision;
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ob = Onboarding::lock(conn, &ob_id)?;
            let (_, su, _, _) = Onboarding::get(conn, &ob.id)?;
            if ob.idv_reqs_initiated_at.is_some() {
                return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
            }

            // Create ManualReview row if requested
            if create_manual_review {
                ManualReview::create(conn, ob.id.clone())?;
            }

            let decision_intent = DecisionIntent::get_or_create_onboarding_kyc(conn, &ob.scoped_vault_id)?;
            // Create some mock verification request and results
            let request = VerificationRequest::bulk_create(
                conn,
                ob.scoped_vault_id.clone(),
                vec![VendorAPI::IdologyExpectID],
                &decision_intent.id,
            )?
            .pop()
            .ok_or(ApiError::ResourceNotFound)?;
            let raw_response = idv::test_fixtures::idology_fake_data_expectid_response();

            // Verification result response is encrypted
            let uv = VerificationRequest::get_user_vault(conn.conn(), request.id.clone())?;
            let e_response = vendor::verification_result::encrypt_verification_result_response(
                &raw_response.clone().into(),
                &uv.public_key,
            )?;

            // NOTE: the raw fixture response we create here won't necessarily match the risk signals we create
            let result =
                VerificationResult::create(conn, request.id, raw_response.into(), e_response, false)?;
            // If the decision is a pass, mark all data as verified for the onboarding
            let seqno = if decision_status == DecisionStatus::Pass {
                let uvw = VaultWrapper::lock_for_onboarding(conn, &su.id)?;
                let seqno = uvw.portablize_identity_data(conn)?;
                Some(seqno)
            } else {
                None
            };

            // Create the decision itself
            // TODO should we move the creation of the decision onto the locked UVW since we also
            // commit the data there? Would dedupe this logic between tests + prod
            let new_decision = OnboardingDecisionCreateArgs {
                vault_id: su.vault_id.clone(),
                onboarding: &ob,
                logic_git_hash: crate::GIT_HASH.to_string(),
                status: decision_status,
                result_ids: vec![result.id],
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno,
            };
            let decision = OnboardingDecision::create(conn, new_decision)?;

            ob.into_inner().update(
                conn,
                OnboardingUpdate::idv_reqs_and_has_final_decision_and_is_authorized(decision_status),
            )?;

            if let Some(biz_ob) = biz_ob {
                // TODO update the rest of the business ob
                let biz_ob = Onboarding::lock(conn, &biz_ob.id)?;
                let (_, sb, _, _) = Onboarding::get(conn, &biz_ob.id)?;
                let new_decision = OnboardingDecisionCreateArgs {
                    vault_id: sb.vault_id,
                    onboarding: &biz_ob,
                    logic_git_hash: crate::GIT_HASH.to_string(),
                    status: decision_status,
                    result_ids: vec![],
                    annotation_id: None,
                    actor: DbActor::Footprint,
                    seqno,
                };
                OnboardingDecision::create(conn, new_decision)?;

                biz_ob.into_inner().update(
                    conn,
                    OnboardingUpdate::idv_reqs_and_has_final_decision_and_is_authorized(decision_status),
                )?;
            }
            let reason_code_map = build_reason_code_map();
            // Create some mock risk signals that are somewhat consistent with the mock decision
            let reason_codes: Vec<FootprintReasonCode> = match (decision_status, create_manual_review) {
                // Straight out rejection
                (DecisionStatus::Fail, false) => {
                    choose_random_reason_codes(reason_code_map, SignalSeverity::High, 3)
                }
                // Manual review
                (DecisionStatus::Fail, true) => {
                    choose_random_reason_codes(reason_code_map, SignalSeverity::Medium, 3)
                }
                // Approved
                (DecisionStatus::Pass, _) => {
                    choose_random_reason_codes(reason_code_map, SignalSeverity::Info, 4)
                }
            };
            let signals = reason_codes
                .into_iter()
                .map(|r| (r, vec![Vendor::Idology]))
                .collect();
            RiskSignal::bulk_create(conn, decision.id, signals)?;
            Ok(())
        })
        .await?;

    Ok(())
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
        .unwrap_or(vec![])
}

fn build_reason_code_map() -> HashMap<SignalSeverity, Vec<FootprintReasonCode>> {
    FootprintReasonCode::iter()
        .filter_map(|rs| {
            if rs.scopes().iter().all(|s| s.is_for_person()) {
                Some((rs.severity(), rs))
            } else {
                None
            }
        })
        .fold(HashMap::new(), |mut acc, (severity, frc)| {
            acc.entry(severity).or_insert(Vec::new()).push(frc);
            acc
        })
}

#[cfg(test)]
mod tests {
    use newtypes::SignalSeverity;
    use test_case::test_case;

    use super::{build_reason_code_map, choose_random_reason_codes};

    #[test_case(1, SignalSeverity::High => 1)]
    #[test_case(3, SignalSeverity::Info => 3)]
    #[test_case(2, SignalSeverity::Medium => 2)]
    fn test_choose_random_reason_codes(n: usize, severity: SignalSeverity) -> usize {
        let rc = build_reason_code_map();
        let result = choose_random_reason_codes(rc, severity.clone(), n);

        assert!(result.iter().all(|r| r.severity() == severity));

        result.len()
    }
}
