use super::{
    map_to_api_err, save_incode_verification_result, AddBack, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::{IncodeContext, IsReady};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeAddFrontRequest;
use newtypes::{DocVData, DocumentSide, IncodeVerificationSessionState, VendorAPI};

pub struct AddFront {}

#[async_trait]
impl IncodeStateTransition for AddFront {
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
            front_image: ctx.docv_data.front_image.clone(),
            country_code: ctx.docv_data.country_code.clone(),
            document_type: ctx.docv_data.document_type,
            ..Default::default()
        };
        let request = IncodeAddFrontRequest {
            credentials: session.credentials.clone(),
            docv_data,
        };
        let res = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //

        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeAddFront, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        let response = res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        // Incode returns 200 for upload failures, so catch these here
        let failure_reason = response.add_side_failure_reason();

        let ctx = ctx.clone();
        let session_id = session.id.clone();
        let result = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                // If there's failure, we move to retry upload
                let result = if let Some(reason) = failure_reason {
                    // If we failed, save the reason, stay in the same state, and clear the front image
                    let update = UpdateIncodeVerificationSession::set_failure_reason(reason);
                    IncodeVerificationSession::update(conn, &session_id, update)?;

                    super::on_upload_fail(conn, &ctx, vec![DocumentSide::Front])?;
                    (self.into(), false)
                } else {
                    let update =
                        UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::AddBack);
                    IncodeVerificationSession::update(conn, &session_id, update)?;

                    // TODO skip AddBack depending on what is required for the doc type
                    // Add an ::enter that will decide given the context if we need to do add back
                    let next_state = AddBack {};
                    (next_state.into(), true)
                };

                Ok(result)
            })
            .await?;

        Ok(result)
    }

    fn is_ready(&self, ctx: &IncodeContext) -> bool {
        ctx.docv_data.front_image.is_some()
    }
}
