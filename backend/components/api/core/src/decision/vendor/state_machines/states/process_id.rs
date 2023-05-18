use super::{
    map_to_api_err, save_incode_verification_result, FetchScores, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::models::verification_request::VerificationRequest;
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::IncodeProcessIdRequest;
use newtypes::{
    DecisionIntentId, DocVData, IncodeVerificationSessionState, ScopedVaultId, VaultPublicKey, VendorAPI,
};

pub struct ProcessId {
    pub session: VerificationSession,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: DecisionIntentId,
    pub process_id_verification_request: VerificationRequest,
}

#[async_trait]
impl IncodeStateTransition for ProcessId {
    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        uv_public_key: VaultPublicKey,
        _docv_data: &DocVData,
    ) -> Result<IncodeState, ApiError> {
        let sv_id = self.scoped_vault_id.clone();
        let di_id = self.decision_intent_id.clone();

        //
        // make the request to incode
        //
        let process_id_vreq_id = self.process_id_verification_request.id.clone();

        let request = IncodeProcessIdRequest {
            credentials: self.session.credentials.clone(),
        };
        let request_result = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let save_verification_result_args =
            SaveVerificationResultArgs::from((&request_result, process_id_vreq_id));

        save_incode_verification_result(db_pool, save_verification_result_args, &uv_public_key).await?;

        // Now ensure we don't have an error
        request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        //
        // Set up the next state transition
        //
        // Save the next stage's Vreq
        let verification_session_id = self.session.id.clone();
        let process_id_vreq = db_pool
            .db_transaction(move |conn| -> ApiResult<VerificationRequest> {
                let res = VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeFetchScores)?;

                let update =
                    UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::FetchScores);

                IncodeVerificationSession::update(conn, verification_session_id, update)?;

                Ok(res)
            })
            .await?;

        Ok(FetchScores {
            session: self.session.clone(),
            scoped_vault_id: self.scoped_vault_id.clone(),
            decision_intent_id: self.decision_intent_id.clone(),
            fetch_scores_verification_request: process_id_vreq,
        }
        .into())
    }
}
