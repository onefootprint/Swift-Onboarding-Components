use super::{
    map_to_api_err, save_incode_verification_result, AddFront, Complete, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::IncodeFetchOCRRequest;
use newtypes::{DocumentSide, IncodeFailureReason, VendorAPI};
use strum::IntoEnumIterator;

pub struct FetchOCR {
    response: FetchOCRResponse,
}

#[async_trait]
impl IncodeStateTransition for FetchOCR {
    async fn run(
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        // make the request to incode
        let request = IncodeFetchOCRRequest {
            credentials: session.credentials.clone(),
        };
        let res = http_client.make_request(request).await;

        // Save our result
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeFetchOCR, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        let response = res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        Ok(Some(Self { response }))
    }

    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<(IncodeState, Option<IncodeFailureReason>)> {
        let result = match self.response.document_kind() {
            Ok(dk) => {
                // TODO could represent enter inside the state transition
                Complete::enter(conn, &ctx.vault, &ctx.sv_id, &ctx.id_doc_id, dk, self.response)?;
                (Complete::new(), None)
            }
            Err(_) => {
                // If we got a different document kind, fail and make a new document request
                super::on_upload_fail(conn, ctx, DocumentSide::iter().collect())?;
                let next_step = AddFront::new();
                (next_step, Some(IncodeFailureReason::UnknownDocumentType))
            }
        };

        Ok(result)
    }
}
