use super::{
    map_to_api_err, save_incode_verification_result, IncodeState, IncodeStateTransition, ProcessId,
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
use idv::incode::doc::IncodeAddBackRequest;
use newtypes::IncodeVerificationFailureReason;
use newtypes::{DocVData, IncodeVerificationSessionState, VendorAPI};

pub struct AddBack {}

#[async_trait]
impl IncodeStateTransition for AddBack {
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
        let docv_data = DocVData {
            back_image: ctx.docv_data.back_image.clone(),
            country_code: ctx.docv_data.country_code.clone(),
            document_type: ctx.docv_data.document_type,
            ..Default::default()
        };
        let request = IncodeAddBackRequest {
            credentials: session.credentials.clone(),
            docv_data,
        };
        let request_result = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let args = SaveVerificationResultArgs::from(&request_result, VendorAPI::IncodeAddBack, ctx);
        save_incode_verification_result(db_pool, args).await?;

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
        let ctx = ctx.clone();
        let session_id = session.id.clone();
        let next_state = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                // If there's failure, we move to retry upload
                let next_state = if let Some(reason) = failure_reason {
                    let update =
                        UpdateIncodeVerificationSession::set_state_to_retry_with_failure_reason(reason);
                    IncodeVerificationSession::update(conn, &session_id, update)?;

                    RetryUpload::enter(conn, &ctx)?.into()
                } else {
                    let update =
                        UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::ProcessId);
                    IncodeVerificationSession::update(conn, &session_id, update)?;

                    ProcessId {}.into()
                };

                Ok(next_state)
            })
            .await?;

        Ok(next_state)
    }
}
