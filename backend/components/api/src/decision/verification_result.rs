use db::models::{audit_trail::AuditTrail, verification_result::VerificationResult};
use idv::IdvResponse;
use newtypes::{TenantId, UserVaultId, VerificationRequestId};

use crate::{errors::ApiError, State};

/// Save a verification result and emit an AuditTrail log
pub(super) async fn save_verification_result(
    state: &State,
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    verification_request_id: VerificationRequestId,
    idv_response: IdvResponse,
) -> Result<(), ApiError> {
    // Atomically create the VerificationResult row, update the status of the onboarding, and
    // create new audit trails
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let result =
                VerificationResult::create(conn, verification_request_id, idv_response.raw_response)?;
            idv_response.audit_events.into_iter().try_for_each(|e| {
                AuditTrail::create(
                    conn,
                    e,
                    user_vault_id.clone(),
                    Some(tenant_id.clone()),
                    Some(result.id.clone()),
                )
            })?;

            Ok(())
        })
        .await?;

    Ok(())
}
