use db::{
    models::{audit_trail::AuditTrail, onboarding_decision::OnboardingDecision, risk_signal::RiskSignal},
    TxnPgConnection,
};
use newtypes::{
    AuditTrailEvent, ComplianceStatus, FootprintReasonCode, OnboardingId, OnboardingStatus, SignalScope,
    TenantId, UserVaultId, Vendor, VerificationInfo, VerificationInfoStatus, VerificationStatus,
};

use crate::{
    errors::{ApiError, ApiResult},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

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
    user_vault_id: UserVaultId,
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
    let decision = OnboardingDecision::create(
        conn,
        user_vault_id.clone(),
        ob_id.clone(),
        "TODO GIT HASH".to_owned(),
        None,
        decision_status,
        ComplianceStatus::Compliant,
    )?;
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
    RiskSignal::bulk_create(conn, decision.id, reason_codes)?;

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
            user_vault_id.clone(),
            Some(tenant_id.clone()),
            None,
        )
    })?;
    Ok(())
}
