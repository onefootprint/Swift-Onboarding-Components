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
use idv::incode::doc::IncodeAddBackRequest;
use newtypes::{DocVData, VendorAPI};
use newtypes::{DocumentSide, IncodeFailureReason};

pub struct AddBack {
    failure_reason: Option<IncodeFailureReason>,
}

#[async_trait]
impl IncodeStateTransition for AddBack {
    async fn run(
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        let Some(back_image) = ctx.docv_data.back_image.clone() else {
            // Not ready to run
            return Ok(None);
        };
        // make the request to incode
        let docv_data = DocVData {
            back_image: Some(back_image),
            country_code: ctx.docv_data.country_code.clone(),
            document_type: ctx.docv_data.document_type,
            ..Default::default()
        };
        let request = IncodeAddBackRequest {
            credentials: session.credentials.clone(),
            docv_data,
        };
        let request_result = http_client.make_request(request).await;

        // Save our result
        let args = SaveVerificationResultArgs::from(&request_result, VendorAPI::IncodeAddBack, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        let response = request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        // Incode returns 200 for upload failures, so catch these here
        let failure_reason = response.add_side_failure_reason();

        Ok(Some(Self { failure_reason }))
    }

    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<(IncodeState, Option<IncodeFailureReason>)> {
        let next_state = if let Some(reason) = self.failure_reason {
            super::on_upload_fail(conn, ctx, vec![DocumentSide::Back])?;
            (Self::new(), Some(reason))
        } else {
            let next_state = super::next_side_to_collect(DocumentSide::Back, &ctx.docv_data, session)?;
            (next_state, None)
        };

        Ok(next_state)
    }
}
