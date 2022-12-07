use db::models::{
    manual_review::ManualReview,
    onboarding::{Onboarding, OnboardingUpdate},
    onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
    risk_signal::RiskSignal,
    verification_request::VerificationRequest,
    verification_result::VerificationResult,
};
use newtypes::{DbActor, DecisionStatus, FootprintReasonCode, OnboardingId, Vendor, VendorAPI};

use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

use super::vendor::build_request;

type ShouldInitiateVerificationRequests = bool;

// Logic to figure out test status from some of the identity data we collected during onboarding
// As of 2022-10-15 we do this by looking at the phone number
pub(super) async fn should_initiate_idv_or_else_setup_test_fixtures(
    state: &State,
    uvw: UserVaultWrapper,
    ob_id: OnboardingId,
) -> ApiResult<ShouldInitiateVerificationRequests> {
    let decrypted_phone = if !uvw.user_vault.is_live {
        let phone_number = uvw.get_decrypted_primary_phone(state).await?;
        Some(phone_number)
    } else {
        None
    };

    let (decision_status, create_manual_review) = if let Some(decrypted_phone) = decrypted_phone {
        // This is a sandbox user vault. Check for pre-set validation cases
        if decrypted_phone.suffix.starts_with("idv") {
            // ALERT ALERT
            // This is the only case that actually triggers the production flow that talks to data vendors
            // All other cases (ironically including non-sandbox users) end up triggering the fixture code path
            return Ok(true);
        } else if decrypted_phone.suffix.starts_with("fail") {
            (DecisionStatus::Fail, false)
        } else if decrypted_phone.suffix.starts_with("manualreview") {
            (DecisionStatus::Fail, true)
        } else {
            (DecisionStatus::Pass, false)
        }
    } else {
        // BIG TODO: This controls whether or not we send actual verification requests, we need to revisit
        (DecisionStatus::Pass, false)
    };

    // Create the test fixture data
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ob = Onboarding::lock(conn, &ob_id)?;
            if ob.idv_reqs_initiated {
                return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
            }
            ob.update(conn, OnboardingUpdate::idv_reqs_initiated(true))?;

            // Create ManualReview row if requested
            if create_manual_review {
                ManualReview::create(conn, ob_id.clone())?;
            }

            // Create some mock verification request and results
            let request =
                build_request::build_verification_request(&uvw, ob_id.clone(), VendorAPI::IdologyExpectID);
            let request = VerificationRequest::bulk_save(conn, vec![request])?
                .pop()
                .ok_or(ApiError::ResourceNotFound)?;
            let raw_response = idv::test_fixtures::idology_fake_data_expectid_response();
            // NOTE: the raw fixture response we create here won't necessarily match the risk signals we create
            let result = VerificationResult::create(conn, request.id, raw_response)?;
            // Create the decision itself
            let new_decision = OnboardingDecisionCreateArgs {
                user_vault_id: uvw.user_vault.id.clone(),
                onboarding_id: ob_id,
                logic_git_hash: crate::GIT_HASH.to_string(),
                status: decision_status,
                result_ids: vec![result.id],
                annotation_id: None,
                actor: DbActor::Footprint,
            };
            let decision = OnboardingDecision::create(conn, new_decision)?;

            // Create some mock risk signals that are somewhat consistent with the mock decision
            let reason_codes = match (decision_status, create_manual_review) {
                // Straight out rejection
                (DecisionStatus::Fail, false) => vec![
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::SsnIssuedPriorToDob,
                ],
                // Manual review
                (DecisionStatus::Fail, true) => vec![
                    FootprintReasonCode::SsnDoesNotMatchWithinTolerance,
                    FootprintReasonCode::LastNameDoesNotMatch,
                ],
                // Approved
                (DecisionStatus::Pass, _) => vec![
                    FootprintReasonCode::MobileNumber,
                    FootprintReasonCode::CorporateEmailDomain,
                ],
                _ => vec![],
            };
            let signals = reason_codes
                .into_iter()
                .map(|r| (r, vec![Vendor::Idology]))
                .collect();
            RiskSignal::bulk_create(conn, decision.id, signals)?;
            Ok(())
        })
        .await?;
    Ok(false)
}
