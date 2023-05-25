use super::{
    map_to_api_err, save_incode_verification_result, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeAddFrontRequest;
use newtypes::{DocVData, DocumentSide, IncodeFailureReason, VendorAPI};

pub struct AddFront {
    failure_reason: Option<IncodeFailureReason>,
}

#[async_trait]
impl IncodeStateTransition for AddFront {
    /// Initializes a state of this type, performing all async operations needed before the atomic
    /// bookkeeping and state transition.
    /// If None is returned, the state is not ready to run
    async fn run(
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        let Some(front_image) = ctx.docv_data.front_image.clone() else {
            // Not ready to run
            return Ok(None);
        };

        // make the request to incode
        let docv_data = DocVData {
            front_image: Some(front_image),
            country_code: ctx.docv_data.country_code.clone(),
            document_type: ctx.docv_data.document_type,
            ..Default::default()
        };
        let request = IncodeAddFrontRequest {
            credentials: session.credentials.clone(),
            docv_data,
        };
        let res = http_client.make_request(request).await;

        // Save our result

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

        Ok(Some(Self { failure_reason }))
    }

    /// Perform any bookkeeping that must be atomic with the state transition. Can access any
    /// context created in `init`
    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<(IncodeState, Option<IncodeFailureReason>)> {
        // If there's failure, we move to retry upload
        let result = if let Some(reason) = self.failure_reason {
            super::on_upload_fail(conn, ctx, vec![DocumentSide::Front])?;
            (Self::new(), Some(reason))
        } else {
            let next_state = super::next_side_to_collect(DocumentSide::Front, &ctx.docv_data, session)?;
            (next_state, None)
        };

        Ok(result)
    }
}
