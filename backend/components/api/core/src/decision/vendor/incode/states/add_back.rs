use super::{
    map_to_api_err, save_incode_verification_result, IncodeStateTransition, ProcessId,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::StateResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::incode::doc::response::AddSideResponse;
use idv::incode::doc::IncodeAddBackRequest;
use newtypes::DocumentSide;
use newtypes::{DocVData, VendorAPI};

pub struct AddBack {
    response: AddSideResponse,
}

#[async_trait]
impl IncodeStateTransition for AddBack {
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
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
        let request_result = clients.incode_add_back.make_request(request).await;

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
        ctx: &IncodeContext,
        _session: &VerificationSession,
    ) -> ApiResult<StateResult> {
        // Ensure we've gotten a doc type we can support
        //
        // Theoretically if we progressed to back fine, and are _now_ getting this error, it
        // means the user switched document types halfway through or incode is bugging out. One option is
        // to require them to go back to AddFront, but we'll assume that having a front and back from different documents will
        // fail upon processing, and this state is just about collecting documents to produce a score, so I think it's ok
        let type_of_id = self.response.type_of_id.as_ref();
        let country_code = self.response.country_code.as_ref();
        let mismatch_reason = super::parse_type_of_id(ctx, type_of_id, country_code)?.err();
        let mut failure_reasons = self.response.failure_reasons();
        if let Some(reason) = mismatch_reason {
            failure_reasons.push(reason);
        }

        if !failure_reasons.is_empty() {
            return Ok(StateResult::Retry {
                next_state: Self::new(),
                reasons: failure_reasons,
                clear_sides: vec![DocumentSide::Back],
            });
        }
        Ok(ProcessId::new().into())
    }
}
