use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use db::models::{
    audit_trail::AuditTrail,
    document_request::DocumentRequest,
    onboarding::{Onboarding, OnboardingUpdate},
    verification_request::VerificationRequest,
    verification_result::VerificationResult,
};
use idv::IdvResponse;
use newtypes::{AuditTrailEvent, KycStatus, OnboardingId, TenantId, UserVaultId, Vendor, VerificationInfo};

pub(super) async fn process_idv_request(
    state: &State,
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    ob_id: OnboardingId,
    request: VerificationRequest,
) -> Result<Option<KycStatus>, ApiError> {
    let request_id = request.id.clone();
    let (
        IdvResponse {
            status,
            audit_events,
            raw_response,
        },
        collect_document_id_number,
    ) = send_idv_request(state, request).await?;

    // Atomically create the VerificationResult row, update the status of the onboarding, and
    // create new audit trails
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let result = VerificationResult::create(conn, request_id, raw_response)?;
            audit_events.into_iter().try_for_each(|e| {
                AuditTrail::create(
                    conn,
                    e,
                    user_vault_id.clone(),
                    Some(tenant_id.clone()),
                    Some(result.id.clone()),
                )
            })?;
            if let Some(collect_document_id_number) = collect_document_id_number {
                DocumentRequest::create(conn, ob_id, Some(collect_document_id_number))?;
            }
            Ok(())
        })
        .await?;
    Ok(status)
}

async fn send_idv_request(
    state: &State,
    request: VerificationRequest,
) -> Result<(IdvResponse, Option<String>), ApiError> {
    // Build the set of data we will send to the vendor by re-building the UVW from the DB using
    // the pointers to pieces of user data saved on the VerificationRequest
    // This is unnecessary right now, but will allow us to re-run this logic when this task is async
    let vendor = request.vendor;
    let uvw = state
        .db_pool
        .db_query(|conn| UserVaultWrapper::from_verification_request(conn, request))
        .await??;
    let data_to_verify = super::build_request::build_idv_data(&uvw, state).await?;

    // Make the request to the IDV vendor
    let result = match vendor {
        Vendor::Idology => {
            let (raw_response, signal_scopes) = state
                .idology_client
                .verify_expectid(data_to_verify)
                .await
                .map_err(idv::Error::from)?;
            idv::idology::verification::process(raw_response, signal_scopes).map_err(idv::Error::from)?
        }
        Vendor::Twilio => {
            // TODO make it easier to share twilio client between IDV + SMS sending
            let idv_response = idv::twilio::lookup_v2(&state.twilio_client.client, data_to_verify)
                .await
                .map_err(idv::Error::from)?;
            (idv_response, None)
        }
        _ => return Err(ApiError::NotImplemented),
    };

    // Process the response from the IDV vendor
    Ok(result)
}

pub(super) async fn save_final_result(
    state: &State,
    ob_id: OnboardingId,
    result_statuses: Vec<Option<KycStatus>>,
) -> Result<(), ApiError> {
    // TODO build process to run this asynchronously if we crashed before getting here
    // TODO probably don't want to default to failed
    let final_status = result_statuses
        .into_iter()
        .flatten()
        .min()
        .unwrap_or(KycStatus::Failed);
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            Onboarding::update_by_id(conn, &ob_id, OnboardingUpdate::kyc_status(final_status))?;
            if let Some(status) = final_status.audit_status() {
                let (_, scoped_user) = Onboarding::get(conn, &ob_id)?;
                AuditTrail::create(
                    conn,
                    AuditTrailEvent::Verification(VerificationInfo {
                        attributes: vec![],
                        vendor: Vendor::Footprint,
                        status,
                    }),
                    scoped_user.user_vault_id,
                    Some(scoped_user.tenant_id),
                    None,
                )?;
            }
            Ok(())
        })
        .await?;
    Ok(())
}
