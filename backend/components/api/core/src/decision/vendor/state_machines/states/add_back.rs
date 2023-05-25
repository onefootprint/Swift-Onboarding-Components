use super::{
    map_to_api_err, save_incode_verification_result, IncodeState, IncodeStateTransition, ProcessId,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::{IncodeContext, IsReady};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeAddBackRequest;
use newtypes::{DocVData, IncodeVerificationSessionState, VendorAPI};
use newtypes::{DocumentSide, IncodeVerificationFailureReason};

pub struct AddBack {}

#[async_trait]
impl IncodeStateTransition for AddBack {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<(IncodeState, IsReady)> {
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
        let result = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let next_state = if let Some(reason) = failure_reason {
                    // If we failed, save the reason, stay in the same state, and clear the back image
                    let update = UpdateIncodeVerificationSession::set_failure_reason(reason);
                    IncodeVerificationSession::update(conn, &session_id, update)?;

                    super::on_upload_fail(conn, &ctx, vec![DocumentSide::Back])?;
                    (self.into(), false)
                } else {
                    let update =
                        UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::ProcessId);
                    IncodeVerificationSession::update(conn, &session_id, update)?;

                    let next_state = ProcessId {};
                    (next_state.into(), true)
                };

                Ok(next_state)
            })
            .await?;

        Ok(result)
    }

    fn is_ready(&self, ctx: &IncodeContext) -> bool {
        ctx.docv_data.back_image.is_some()
    }
}
