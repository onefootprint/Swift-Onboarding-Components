use db::{
    models::{
        audit_trail::AuditTrail,
        onboarding_decision::{NewOnboardingDecision, OnboardingDecision},
        risk_signal::RiskSignal,
        verification_request::VerificationRequest,
        verification_result::VerificationResult,
    },
    TxnPgConnection,
};
use newtypes::{
    AuditTrailEvent, ComplianceStatus, FootprintReasonCode, OnboardingId, OnboardingStatus, SignalScope,
    TenantId, Vendor, VendorAPI, VerificationInfo, VerificationInfoStatus, VerificationStatus,
};

use crate::{
    errors::{ApiError, ApiResult},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

use super::verification_request::build_request;

// Logic to figure out test status from some of the identity data we collected during onboarding
// As of 2022-10-15 we do this by looking at the phone number
pub(super) async fn get_desired_status_for_testing(
    state: &State,
    uvw: &UserVaultWrapper,
) -> Result<OnboardingStatus, ApiError> {
    let decrypted_phone = if !uvw.user_vault.is_live {
        let phone_number = uvw.get_decrypted_primary_phone(state).await?;
        Some(phone_number)
    } else {
        None
    };
    let desired_status = if let Some(decrypted_phone) = decrypted_phone {
        // This is a sandbox user vault. Check for pre-set validation cases
        if decrypted_phone.suffix.starts_with("fail") {
            OnboardingStatus::Failed
        } else if decrypted_phone.suffix.starts_with("manualreview") {
            OnboardingStatus::ManualReview
        } else if decrypted_phone.suffix.starts_with("idv") {
            OnboardingStatus::Processing
        } else {
            OnboardingStatus::Verified
        }
    } else {
        // TODO kick off user verification with data vendors
        OnboardingStatus::Verified
    };

    Ok(desired_status)
}

pub(super) fn create_test_fixture_data(
    conn: &mut TxnPgConnection,
    uvw: &UserVaultWrapper,
    tenant_id: TenantId,
    ob_id: OnboardingId,
    desired_status: OnboardingStatus,
) -> ApiResult<()> {
    let decision_status = match desired_status {
        OnboardingStatus::Verified => VerificationStatus::Verified,
        OnboardingStatus::Failed => VerificationStatus::Failed,
        OnboardingStatus::ManualReview => VerificationStatus::ManualReview,
        _ => VerificationStatus::Failed,
    };
    // Create some mock verification request and results
    let request = build_request::build_verification_request(uvw, ob_id.clone(), VendorAPI::IdologyExpectID);
    let request = VerificationRequest::bulk_save(conn, vec![request])?
        .pop()
        .ok_or(ApiError::ResourceNotFound)?;
    let raw_response = serde_json::json!({
        "response": {
            "id-number": "3010453",
            "summary-result": {
                "key": "id.success",
                "message": "Pass"
            },
            "results": {
                "key": "result.match",
                "message": "ID Located"
            },
            "qualifiers": {
                "qualifier": [
                    {
                        "key": "idphone.wireless",
                        "message": "Possible Wireless Number"
                    },
                    {
                        "key": "resultcode.corporate.email.domain",
                        "message": "Indicates that the domain of the email address has been identified as belonging to a corporate entity.",
                    },
                ]
            }
        }
    });
    // NOTE: the raw fixture response we create here won't necessarily match the risk signals we create
    let result = VerificationResult::create(conn, request.id, raw_response)?;
    // Create the decision itself
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

    // Create some risk signals
    let reason_codes = match desired_status {
        OnboardingStatus::Failed => vec![
            FootprintReasonCode::SubjectDeceased,
            FootprintReasonCode::SsnIssuedPriorToDob,
        ],
        OnboardingStatus::Verified => vec![
            FootprintReasonCode::MobileNumber,
            FootprintReasonCode::CorporateEmailDomain,
        ],
        OnboardingStatus::ManualReview => vec![
            FootprintReasonCode::SsnDoesNotMatchWithinTolerance,
            FootprintReasonCode::LastNameDoesNotMatch,
        ],
        _ => vec![],
    };
    let signals = reason_codes
        .into_iter()
        .map(|r| (r, vec![Vendor::Idology]))
        .collect();
    RiskSignal::bulk_create(conn, decision.id, signals)?;

    // Create old AuditTrail events
    let final_status = match &desired_status {
        OnboardingStatus::Verified => VerificationInfoStatus::Verified,
        _ => VerificationInfoStatus::Failed,
    };
    let events = vec![
        VerificationInfo {
            attributes: vec![SignalScope::Name, SignalScope::Dob],
            vendor: Vendor::Experian,
            status: VerificationInfoStatus::Verified,
        },
        VerificationInfo {
            attributes: vec![SignalScope::Country, SignalScope::State],
            vendor: Vendor::Socure,
            status: VerificationInfoStatus::Verified,
        },
        VerificationInfo {
            attributes: vec![SignalScope::StreetAddress, SignalScope::City, SignalScope::Zip],
            vendor: Vendor::Idology,
            status: VerificationInfoStatus::Verified,
        },
        VerificationInfo {
            attributes: vec![SignalScope::Ssn],
            vendor: Vendor::LexisNexis,
            status: final_status,
        },
    ];
    events.into_iter().try_for_each(|e| {
        AuditTrail::create(
            conn,
            AuditTrailEvent::Verification(e),
            uvw.user_vault.id.clone(),
            Some(tenant_id.clone()),
            None,
        )
    })?;
    Ok(())
}


