use super::{
    map_to_api_err, save_incode_verification_result, AddFront, Complete, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::id_doc_kind_from_incode_document_type;
use crate::decision::vendor::incode::{state::StateResult, IncodeContext};
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
    ) -> ApiResult<StateResult> {
        let result = match id_doc_kind_from_incode_document_type(
            self.response.document_kind().map_err(idv::Error::from)?,
        ) {
            Ok(dk) => {
                // TODO could represent enter inside the state transition
                Complete::enter(conn, &ctx.vault, &ctx.sv_id, &ctx.id_doc_id, dk, self.response)?;
                Complete::new().into()
            }
            Err(_) => {
                // If we got a different document kind, wipe all uploaded documents and send back
                // to the AddFront state
                //
                // Since we do this in AddFront and AddBack as well, we will hopefully never hit this case.
                return Ok(StateResult::Retry {
                    next_state: AddFront::new(),
                    reasons: vec![IncodeFailureReason::UnknownDocumentType],
                    clear_sides: DocumentSide::iter().collect(),
                });
            }
        };

        Ok(result)
    }
}
