use super::{
    map_to_api_err, save_incode_verification_result, AddFront, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::models::verification_request::VerificationRequest;
use db::DbPool;
use db::{models::user_consent::UserConsent, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::{IncodeAddMLConsentRequest, IncodeAddPrivacyConsentRequest};
use newtypes::{
    DecisionIntentId, DocVData, IdentityDocumentId, IncodeVerificationSessionState, ScopedVaultId,
    VaultPublicKey, VendorAPI,
};

/// Add Consent
pub struct AddConsent {
    pub session: VerificationSession,
    pub user_consent_text: String,
    pub privacy_vreq: VerificationRequest,
    pub ml_vreq: VerificationRequest,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: DecisionIntentId,
    pub identity_document_id: IdentityDocumentId,
}

impl AddConsent {
    pub fn enter(
        conn: &mut TxnPgConn,
        scoped_vault_id: ScopedVaultId,
        decision_intent_id: DecisionIntentId,
        identity_document_id: IdentityDocumentId,
        session: VerificationSession,
    ) -> ApiResult<Self> {
        // we need consent in order to proceed, so we error
        let consent = UserConsent::latest_for_scoped_vault(conn, &scoped_vault_id)?
            .ok_or(ApiError::AssertionError("User consent not found".into()))?;

        let privacy_vreq = VerificationRequest::create(
            conn,
            &scoped_vault_id,
            &decision_intent_id,
            VendorAPI::IncodeAddPrivacyConsent,
        )?;

        let ml_vreq = VerificationRequest::create(
            conn,
            &scoped_vault_id,
            &decision_intent_id,
            VendorAPI::IncodeAddMLConsent,
        )?;

        Ok(Self {
            session,
            user_consent_text: consent.consent_language_text,
            scoped_vault_id,
            decision_intent_id,
            identity_document_id,
            privacy_vreq,
            ml_vreq,
        })
    }
}

#[async_trait]
impl IncodeStateTransition for AddConsent {
    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        uv_public_key: VaultPublicKey,
        _docv_data: &DocVData,
    ) -> Result<IncodeState, ApiError> {
        let sv_id = self.scoped_vault_id.clone();
        let di_id = self.decision_intent_id.clone();
        let id_doc_id = self.identity_document_id.clone();

        let privacy_request = IncodeAddPrivacyConsentRequest {
            credentials: self.session.credentials.clone(),
            title: "Service Consent".into(),
            content: self.user_consent_text.to_owned(),
        };
        // TODO this should be separated out from privacy in bifrost
        let ml_request = IncodeAddMLConsentRequest {
            credentials: self.session.credentials.clone(),
            status: true,
        };

        let privacy_request_result = footprint_http_client.make_request(privacy_request).await;
        let ml_request_result = footprint_http_client.make_request(ml_request).await;

        //
        // Save our result
        //
        let save_privacy_verification_result_args =
            SaveVerificationResultArgs::from((&privacy_request_result, self.privacy_vreq.id.clone()));
        let save_ml_verification_result_args =
            SaveVerificationResultArgs::from((&ml_request_result, self.ml_vreq.id.clone()));

        save_incode_verification_result(db_pool, save_privacy_verification_result_args, &uv_public_key)
            .await?;
        save_incode_verification_result(db_pool, save_ml_verification_result_args, &uv_public_key).await?;

        // Now ensure we don't have an error
        privacy_request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        ml_request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        //
        // Set up the next state transition
        //
        // Save the next stage's Vreq
        let session1 = self.session.clone();
        let next_state = db_pool
            .db_transaction(move |conn| -> ApiResult<IncodeState> {
                let update =
                    UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::AddFront);

                IncodeVerificationSession::update(conn, session1.id.clone(), update)?;

                let next = AddFront::enter(conn, sv_id, di_id, id_doc_id, session1)?.into();

                Ok(next)
            })
            .await?;
        Ok(next_state)
    }
}
