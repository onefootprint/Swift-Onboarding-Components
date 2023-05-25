use super::{
    map_to_api_err, save_incode_verification_result, AddFront, Complete, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::{IncodeContext, IsReady};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeFetchOCRRequest;
use newtypes::{DocumentSide, IncodeVerificationFailureReason, IncodeVerificationSessionState, VendorAPI};
use strum::IntoEnumIterator;

pub struct FetchOCR {}

#[async_trait]
impl IncodeStateTransition for FetchOCR {
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
        let result = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let result = match response.document_kind() {
                    Ok(dk) => {
                        let update = UpdateIncodeVerificationSession::set_state(
                            IncodeVerificationSessionState::Complete,
                        );
                        IncodeVerificationSession::update(conn, &session_id, update)?;

                        let next_step =
                            Complete::enter(conn, &ctx.vault, &ctx.sv_id, &ctx.id_doc_id, dk, response)?;
                        (next_step.into(), true)
                    }
                    Err(_) => {
                        // If we got a different document kind, fail and make a new document request
                        let update = UpdateIncodeVerificationSession::set_failure_reason(
                            IncodeVerificationFailureReason::UnknownDocumentType,
                        );
                        IncodeVerificationSession::update(conn, &session_id, update)?;

                        super::on_upload_fail(conn, &ctx, DocumentSide::iter().collect())?;
                        let next_step = AddFront {};
                        (next_step.into(), false)
                    }
                };

                Ok(result)
            })
            .await?;

        Ok(result)
    }

    fn is_ready(&self, _: &IncodeContext) -> bool {
        true
    }
}
