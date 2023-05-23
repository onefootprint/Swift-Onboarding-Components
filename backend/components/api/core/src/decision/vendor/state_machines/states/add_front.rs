use super::{
    map_to_api_err, save_incode_verification_result, AddBack, IncodeState, IncodeStateTransition,
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
use idv::incode::doc::IncodeAddFrontRequest;
use newtypes::{DocVData, IncodeVerificationSessionState, VendorAPI};

pub struct AddFront {
    pub session: VerificationSession,
}

#[async_trait]
impl IncodeStateTransition for AddFront {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError> {
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
            credentials: self.session.credentials.clone(),
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
        let next_state = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                // If there's failure, we move to retry upload
                let next_state = if let Some(reason) = failure_reason {
                    let update =
                        UpdateIncodeVerificationSession::set_state_to_retry_with_failure_reason(reason);
                    IncodeVerificationSession::update(conn, &self.session.id, update)?;

                    RetryUpload::enter(conn, &ctx, self.session)?.into()
                } else {
                    let update =
                        UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::AddBack);
                    IncodeVerificationSession::update(conn, &self.session.id, update)?;

                    // TODO skip AddBack depending on what is required for the doc type
                    // Add an ::enter that will decide given the context if we need to do add back
                    AddBack {
                        session: self.session,
                    }
                    .into()
                };

                Ok(next_state)
            })
            .await?;

        Ok(next_state)
    }
}
