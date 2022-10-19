use crate::{errors::ApiError, utils::user_vault_wrapper::UserVaultWrapper};

use db::{
    models::{
        audit_trail::AuditTrail,
        onboarding::{Onboarding, OnboardingUpdate},
        verification_request::VerificationRequest,
    },
    TxnPgConnection,
};
use newtypes::{
    AuditTrailEvent, OnboardingStatus, SignalScope, TenantId, Vendor, VerificationInfo,
    VerificationInfoStatus,
};

pub(super) mod build_request;
pub(super) mod make_request;

/// Build verification requests from the UserVaultWrapper and save.
/// We save so that if something happens, we can always replay the requests
pub fn build_verification_requests_and_checkpoint(
    conn: &mut TxnPgConnection,
    ob: Onboarding,
    uvw: &UserVaultWrapper,
    tenant_id: &TenantId,
    desired_status: OnboardingStatus,
    vendors: Vec<Vendor>,
) -> Result<Vec<VerificationRequest>, ApiError> {
    // TODO decide when to re-KYC
    // Create the VerificationRequest and mark the onboarding's kyc_status
    let ob = ob.update(conn, OnboardingUpdate::status(desired_status))?;

    if desired_status == OnboardingStatus::Processing {
        let requests_to_initiate = vendors
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
    Ok(vec![])
}
