use super::{
    map_to_api_err, save_incode_verification_result, IncodeStateTransition, ProcessFace,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::StateResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeAddSelfieRequest;
use newtypes::{DocVData, VendorAPI};
use newtypes::{DocumentSide, IncodeFailureReason};

pub struct AddSelfie {
    failure_reasons: Vec<IncodeFailureReason>,
}

#[async_trait]
impl IncodeStateTransition for AddSelfie {
    async fn run(
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        let Some(selfie_image) = ctx.docv_data.selfie_image.clone() else {
            // Not ready to run
            return Ok(None);
        };
        // make the request to incode
        let docv_data = DocVData {
            selfie_image: Some(selfie_image),
            country_code: ctx.docv_data.country_code.clone(),
            document_type: ctx.docv_data.document_type,
            ..Default::default()
        };
        let request = IncodeAddSelfieRequest {
            credentials: session.credentials.clone(),
            docv_data,
        };
        let request_result = http_client.make_request(request).await;

        // Save our result
        let args = SaveVerificationResultArgs::from(&request_result, VendorAPI::IncodeAddSelfie, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        let response = request_result.map_err(map_to_api_err)?.result;
        let failure_reasons = match response.into_success() {
            // Incode returns 200 for upload failures, so catch these here
            Ok(response) => Ok(response.failure_reasons()),
            Err(idv::incode::error::Error::APIResponseError(e)) => match e.error.as_str() {
                "Face not found." => Ok(vec![IncodeFailureReason::SelfieFaceNotFound]),
                // TODO there are probably more retryable errors in here
                _ => Err(idv::incode::error::Error::APIResponseError(e)),
            },
            Err(e) => Err(e),
        }
        .map_err(map_to_api_err)?;

        Ok(Some(Self { failure_reasons }))
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _ctx: &IncodeContext,
        _session: &VerificationSession,
    ) -> ApiResult<StateResult> {
        if !self.failure_reasons.is_empty() {
            return Ok(StateResult::Retry {
                next_state: Self::new(),
                reasons: self.failure_reasons,
                clear_sides: vec![DocumentSide::Selfie],
            });
        }

        let next = ProcessFace::new();
        Ok(next.into())
    }
}
