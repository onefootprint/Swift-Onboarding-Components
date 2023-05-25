use super::{
    map_to_api_err, save_incode_verification_result, Complete, IncodeState, IncodeStateTransition,
    RetryUpload, SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeFetchOCRRequest;
use newtypes::{IncodeVerificationFailureReason, IncodeVerificationSessionState, VendorAPI};

pub struct FetchOCR {}

#[async_trait]
impl IncodeStateTransition for FetchOCR {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> Result<IncodeState, ApiError> {
        //
        // make the request to incode
        //
        let request = IncodeFetchOCRRequest {
            credentials: session.credentials.clone(),
        };
        let res = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeFetchOCR, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        let response = res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        let ctx = ctx.clone();
        let session_id = session.id.clone();
        let next_step = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let next_step = match response.document_kind() {
                    Ok(dk) => {
                        let update = UpdateIncodeVerificationSession::set_state(
                            IncodeVerificationSessionState::Complete,
                        );
                        IncodeVerificationSession::update(conn, &session_id, update)?;

                        Complete::enter(conn, &ctx.vault, &ctx.sv_id, &ctx.id_doc_id, dk, response)?.into()
                    }
                    Err(_) => {
                        let update = UpdateIncodeVerificationSession::set_state_to_retry_with_failure_reason(
                            IncodeVerificationFailureReason::UnknownDocumentType,
                        );
                        IncodeVerificationSession::update(conn, &session_id, update)?;

                        // TODO If the document uploaded isn't supported, retry.
                        // Should we include some context on the error here?
                        RetryUpload::enter(conn, &ctx)?.into()
                    }
                };

                Ok(next_step)
            })
            .await?;

        Ok(next_step)
    }
}
