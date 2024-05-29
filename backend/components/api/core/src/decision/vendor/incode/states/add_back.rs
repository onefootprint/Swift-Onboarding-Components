use super::{
    AddConsent,
    AddSelfie,
    AddSideResponseHelper,
    IncodeStateTransition,
    VerificationSession,
};
use crate::decision::vendor::incode::state::{
    IncodeState,
    TransitionResult,
};
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::map_to_api_error;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::{
    DbPool,
    TxnPgConn,
};
use either::Either;
use idv::incode::doc::IncodeAddBackRequest;
use newtypes::{
    DocVData,
    DocumentSide,
    IncodeFailureReason,
    VendorAPI,
};

pub struct AddBack {
    add_side_response_helper: AddSideResponseHelper,
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
        args.save(db_pool).await?;

        // TODO: fix this
        let response = request_result.map_err(map_to_api_error)?.result;

        let (
            type_of_id,
            document_subtype,
            country_code,
            failure_reasons_from_response,
            failure_reasons_from_api_error,
        ) = match response.safe_into_success() {
            Either::Left(response) => (
                response.type_of_id.clone(),
                response.document_sub_type().clone(),
                response.country_code.clone(),
                // TODO: add restrictions from OBC
                response.failure_reasons(AddSideResponseHelper::get_restrictions(
                    &ctx.tenant_id,
                    ctx.ff_client.clone(),
                    ctx.failed_attempts_for_side,
                )),
                vec![],
            ),
            Either::Right(failure_reasons) => (
                None,
                None,
                None,
                vec![],
                failure_reasons.unwrap_or(vec![IncodeFailureReason::UnexpectedErrorOccurred]),
            ),
        };

        Ok(Some(Self {
            add_side_response_helper: AddSideResponseHelper {
                type_of_id,
                document_subtype,
                country_code,
                failure_reasons_from_response,
                failure_reasons_from_api_error,
            },
        }))
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        ctx: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        // Ensure we've gotten a doc type we can support
        //
        // Theoretically if we progressed to back fine, and are _now_ getting this error, it
        // means the user switched document types halfway through or incode is bugging out. One option is
        // to require them to go back to AddFront, but we'll assume that having a front and back from
        // different documents will fail upon processing, and this state is just about collecting
        // documents to produce a score, so I think it's ok
        let type_of_id = self.add_side_response_helper.type_of_id.as_ref();
        let document_subtype = self.add_side_response_helper.document_subtype.as_ref();
        let country_code = self.add_side_response_helper.country_code.as_ref();

        let mismatch_reason = if self.add_side_response_helper.has_api_error() {
            None
        } else {
            super::parse_type_of_id(ctx, type_of_id, document_subtype, country_code)?.err()
        };
        let mut failure_reasons = self.add_side_response_helper.failure_reasons();
        if let Some(reason) = mismatch_reason {
            failure_reasons.push(reason);
        }
        let result = TransitionResult {
            failure_reasons,
            side: Some(DocumentSide::Back),
        };
        Ok(result)
    }

    fn next_state(session: &VerificationSession) -> IncodeState {
        if session.kind.requires_selfie() {
            AddSelfie::new()
        } else {
            AddConsent::new()
        }
    }
}
