use super::{AddFront, IncodeState, IncodeStateTransition, VerificationSession};
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::models::verification_request::VerificationRequest;
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use newtypes::{
    DecisionIntentId, DocVData, IdentityDocumentId, IncodeVerificationSessionState, ScopedVaultId,
    VaultPublicKey, VendorAPI,
};

/// Document upload has failed and user needs to retry
pub struct RetryUpload {
    pub session: VerificationSession,
    pub identity_document_id: IdentityDocumentId,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: DecisionIntentId,
}

#[async_trait]
impl IncodeStateTransition for RetryUpload {
    async fn run(
        &self,
        db_pool: &DbPool,
        _footprint_http_client: &FootprintVendorHttpClient,
        _uv_public_key: VaultPublicKey,
        _docv_data: &DocVData,
    ) -> Result<IncodeState, ApiError> {
        let sv_id = self.scoped_vault_id.clone();
        let di_id = self.decision_intent_id.clone();
        let session_id = self.session.id.clone();
        let id_doc_id = self.identity_document_id.clone();
        //
        // Set up the next state transition
        //
        // Save the next stage's Vreq
        let add_front_vreq = db_pool
            .db_transaction(move |conn| -> ApiResult<VerificationRequest> {
                let res = VerificationRequest::create_document_verification_request(
                    conn,
                    VendorAPI::IncodeAddFront,
                    sv_id,
                    id_doc_id.clone(),
                    &di_id,
                )?;

                // Update our state to the next stage and add in the new identity document
                let update = UpdateIncodeVerificationSession::set_state_and_identity_document(
                    IncodeVerificationSessionState::AddFront,
                    id_doc_id,
                );

                IncodeVerificationSession::update(conn, session_id, update)?;

                Ok(res)
            })
            .await?;

        Ok(AddFront {
            session: self.session.to_owned(),
            scoped_vault_id: self.scoped_vault_id.clone(),
            decision_intent_id: self.decision_intent_id.clone(),
            add_front_verification_request: add_front_vreq,
            identity_document_id: self.identity_document_id.clone(),
        }
        .into())
    }
}
