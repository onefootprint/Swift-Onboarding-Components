use crate::{errors::ApiError, utils::user_vault_wrapper::UserVaultWrapper, State};

use db::{
    assert_in_transaction,
    models::{
        audit_trail::AuditTrail,
        onboarding::{Onboarding, OnboardingUpdate},
        verification_request::VerificationRequest,
    },
    PgConnection,
};
use newtypes::{
    AuditTrailEvent, KycStatus, OnboardingId, SignalScope, TenantId, UserVaultId, ValidatedPhoneNumber,
    Vendor, VerificationInfo, VerificationInfoStatus,
};

pub mod build_request;
mod make_request;

pub async fn initiate_idv_requests(
    state: &State,
    ob_id: OnboardingId,
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    requests: Vec<VerificationRequest>,
) -> Result<(), ApiError> {
    // TODO spawn a task to do this asynchronously
    let fut_requests = requests.into_iter().map(|r| {
        make_request::process_idv_request(state, user_vault_id.clone(), tenant_id.clone(), ob_id.clone(), r)
    });
    let result_statuses = futures::future::try_join_all(fut_requests).await?;
    make_request::save_final_result(state, ob_id, result_statuses).await?;
    Ok(())
}

pub fn initiate_verification(
    conn: &mut PgConnection,
    ob: Onboarding,
    uvw: &UserVaultWrapper,
    tenant_id: &TenantId,
    decrypted_phone: Option<ValidatedPhoneNumber>,
) -> Result<Vec<VerificationRequest>, ApiError> {
    // TODO decide when to re-KYC
    assert_in_transaction(conn)?;
    let desired_status = if let Some(decrypted_phone) = decrypted_phone {
        // This is a sandbox user vault. Check for pre-set validation cases
        if decrypted_phone.suffix.starts_with("fail") {
            KycStatus::Failed
        } else if decrypted_phone.suffix.starts_with("manualreview") {
            KycStatus::ManualReview
        } else if decrypted_phone.suffix.starts_with("idv") {
            KycStatus::Processing
        } else {
            KycStatus::Verified
        }
    } else {
        // TODO kick off user verification with data vendors
        KycStatus::Verified
    };

    // Create the VerificationRequest and mark the onboarding's kyc_status as Processing in one transaction
    let ob = ob.update(conn, OnboardingUpdate::kyc_status(desired_status))?;
    if desired_status == KycStatus::Processing {
        let requests_to_initiate = vec![Vendor::Idology, Vendor::Twilio];
        let requests_to_initiate = requests_to_initiate
            .into_iter()
            .map(|v| build_request::build_verification_request(uvw, ob.id.clone(), v))
            .collect();
        let requests = VerificationRequest::bulk_save(conn, requests_to_initiate)?;
        return Ok(requests);
    }

    // If we're not kicking off a verification, just create some fixture events for now
    // Don't make duplicate fixture events if the user onboards multiple times since it
    // isn't very self-explanatory for the demo
    // TODO kick off user verification with data vendors,
    // and don't mark as verified until data verification with vendors is complete
    let final_status = match &desired_status {
        KycStatus::Verified => VerificationInfoStatus::Verified,
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
        VerificationInfo {
            attributes: vec![],
            vendor: Vendor::Footprint,
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
    Ok(vec![])
}
