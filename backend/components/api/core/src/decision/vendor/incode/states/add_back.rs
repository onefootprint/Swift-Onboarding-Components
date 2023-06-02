use super::{
    map_to_api_err, save_incode_verification_result, IncodeStateTransition, ProcessId,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::StateResult;
use crate::decision::vendor::incode::{id_doc_kind_from_incode_document_type, IncodeContext};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::response::AddSideResponse;
use idv::incode::doc::IncodeAddBackRequest;
use newtypes::{DocVData, VendorAPI};
use newtypes::{DocumentSide, IncodeFailureReason};

pub struct AddBack {
    response: AddSideResponse,
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

        Ok(Some(Self { response }))
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _ctx: &IncodeContext,
        _session: &VerificationSession,
    ) -> ApiResult<StateResult> {
        if let Some(reason) = self.response.add_side_failure_reason() {
            return Ok(StateResult::Retry {
                next_state: Self::new(),
                reasons: vec![reason],
                clear_sides: vec![DocumentSide::Back],
            });
        }
        // Ensure we've gotten a doc type we can support
        //
        // Theoretically if we progressed to back fine, and are _now_ getting this error, it
        // means the user switched document types halfway through or incode is bugging out. One option is
        // to require them to go back to AddFront, but we'll assume that having a front and back from different documents will
        // fail upon processing, and this state is just about collecting documents to produce a score, so I think it's ok
        //
        // TODO: support checking against acceptable doc types and countries from OBC
        match id_doc_kind_from_incode_document_type(self.response.document_kind().map_err(idv::Error::from)?)
        {
            Ok(_) => Ok(ProcessId::new().into()),
            Err(_) => Ok(StateResult::Retry {
                next_state: AddBack::new(),
                reasons: vec![IncodeFailureReason::UnknownDocumentType],
                clear_sides: vec![DocumentSide::Back],
            }),
        }
    }
}
