use super::{
    map_to_api_err, save_incode_verification_result, IncodeState, IncodeStateTransition, ProcessId,
    RetryUpload, SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::models::verification_request::VerificationRequest;
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::IncodeAddBackRequest;
use newtypes::IncodeVerificationFailureReason;
use newtypes::{
    DecisionIntentId, DocVData, IdentityDocumentId, IncodeVerificationSessionState, ScopedVaultId,
    VaultPublicKey, VendorAPI,
};

pub struct AddBack {
    pub session: VerificationSession,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: DecisionIntentId,
    pub identity_document_id: IdentityDocumentId,
    pub add_back_verification_request: VerificationRequest,
}

#[async_trait]
impl IncodeStateTransition for AddBack {
    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        uv_public_key: VaultPublicKey,
        docv_data: &DocVData,
    ) -> Result<IncodeState, ApiError> {
        let sv_id = self.scoped_vault_id.clone();
        let di_id = self.decision_intent_id.clone();

        //
        // make the request to incode
        //
        let add_back_vreq_id = self.add_back_verification_request.id.clone();
        let docv_data = DocVData {
            back_image: docv_data.back_image.clone(),
            country_code: docv_data.country_code.clone(),
            document_type: docv_data.document_type,
            ..Default::default()
        };
        let request = IncodeAddBackRequest {
            credentials: self.session.credentials.clone(),
            docv_data,
        };
        let request_result = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let save_verification_result_args =
            SaveVerificationResultArgs::from((&request_result, add_back_vreq_id));

        save_incode_verification_result(db_pool, save_verification_result_args, &uv_public_key).await?;

        // Now ensure we don't have an error
        let response = request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        // Incode returns 200 for upload failures, so catch these here
        let failure_reason = response.add_side_failure_reason().and_then(|r| {
            if r != IncodeVerificationFailureReason::WrongOneSidedDocument {
                Some(r)
            } else {
                None
            }
        });

        //
        // Set up the next state transition
        //
        // Save the next stage's Vreq
        let verification_session_id = self.session.id.clone();
        let process_id_vreq = db_pool
            .db_transaction(move |conn| -> ApiResult<Option<VerificationRequest>> {
                // If there's failure, we move to retry upload
                let vreq = if let Some(reason) = failure_reason {
                    let update =
                        UpdateIncodeVerificationSession::set_state_to_retry_with_failure_reason(reason);
                    IncodeVerificationSession::update(conn, verification_session_id, update)?;

                    None
                } else {
                    let res = VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeProcessId)?;
                    let update =
                        UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::ProcessId);

                    IncodeVerificationSession::update(conn, verification_session_id, update)?;

                    Some(res)
                };

                Ok(vreq)
            })
            .await?;

        if let Some(vreq) = process_id_vreq {
            Ok(ProcessId {
                session: self.session.clone(),
                scoped_vault_id: self.scoped_vault_id.clone(),
                decision_intent_id: self.decision_intent_id.clone(),
                process_id_verification_request: vreq,
            }
            .into())
        } else {
            Ok(RetryUpload {
                session: self.session.clone(),
                scoped_vault_id: self.scoped_vault_id.clone(),
                decision_intent_id: self.decision_intent_id.clone(),
                identity_document_id: self.identity_document_id.clone(),
            }
            .into())
        }
    }
}
