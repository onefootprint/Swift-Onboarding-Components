use db::models::{
    manual_review::ManualReview,
    onboarding::{Onboarding, OnboardingUpdate},
    onboarding_decision::{NewOnboardingDecision, OnboardingDecision},
    risk_signal::RiskSignal,
    verification_request::VerificationRequest,
    verification_result::VerificationResult,
};
use newtypes::{
    ComplianceStatus, FootprintReasonCode, OnboardingId, OnboardingStatus, Vendor, VendorAPI,
    VerificationStatus,
};

use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

use super::verification_request::build_request;

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

    let (desired_status, create_manual_review) = if let Some(decrypted_phone) = decrypted_phone {
        // This is a sandbox user vault. Check for pre-set validation cases
        if decrypted_phone.suffix.starts_with("idv") {
            // ALERT ALERT
            // This is the only case that actually triggers the production flow that talks to data vendors
            // All other cases (ironically including non-sandbox users) end up triggering the fixture code path
            return Ok(true);
        } else if decrypted_phone.suffix.starts_with("fail") {
            (OnboardingStatus::Failed, false)
        } else if decrypted_phone.suffix.starts_with("manualreview") {
            (OnboardingStatus::Failed, true)
        } else {
            (OnboardingStatus::Verified, false)
        }
    } else {
        // BIG TODO: This controls whether or not we send actual verification requests, we need to revisit
        (OnboardingStatus::Verified, false)
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
            // Update the Onboarding's status with the desired testing status
            Onboarding::update_by_id(conn, &ob_id, OnboardingUpdate::status(desired_status))?;

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
            let decision_status = match desired_status {
                OnboardingStatus::Verified => VerificationStatus::Verified,
                OnboardingStatus::Failed => VerificationStatus::Failed,
                _ => VerificationStatus::Failed,
            };
            let new_decision = NewOnboardingDecision {
                user_vault_id: uvw.user_vault.id.clone(),
                onboarding_id: ob_id,
                logic_git_hash: crate::GIT_HASH.to_string(),
                tenant_user_id: None,
                verification_status: decision_status,
                compliance_status: ComplianceStatus::NoFlagsFound,
                result_ids: vec![result.id],
            };
            let decision = OnboardingDecision::create(conn, new_decision)?;

            // Create some mock risk signals that are somewhat consistent with the mock decision
            let reason_codes = match (desired_status, create_manual_review) {
                // Straight out rejection
                (OnboardingStatus::Failed, false) => vec![
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::SsnIssuedPriorToDob,
                ],
                // Manual review
                (OnboardingStatus::Failed, true) => vec![
                    FootprintReasonCode::SsnDoesNotMatchWithinTolerance,
                    FootprintReasonCode::LastNameDoesNotMatch,
                ],
                // Approved
                (OnboardingStatus::Verified, _) => vec![
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
