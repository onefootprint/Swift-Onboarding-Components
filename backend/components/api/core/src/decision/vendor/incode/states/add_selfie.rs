use super::{
    map_to_api_err, save_incode_verification_result, IncodeStateTransition, ProcessFace,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::TransitionResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
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
        clients: &IncodeClients,
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
        let request_result = clients.incode_add_selfie.make_request(request).await;

        // Save our result
        let args = SaveVerificationResultArgs::from(&request_result, VendorAPI::IncodeAddSelfie, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        let response = request_result.map_err(map_to_api_err)?.result;
        let failure_reasons = match response.into_success() {
            // Incode returns 200 for upload failures, so catch these here
            Ok(response) => Ok(response.failure_reasons()),
            // status is a mix of custom error codes and http status codes
            Err(idv::incode::error::Error::APIResponseError(e)) => match e.status {
                4019 => Ok(vec![IncodeFailureReason::SelfieFaceNotFound]),
                4010 => Ok(vec![IncodeFailureReason::SelfieFaceNotFound]),
                1001 => Ok(vec![IncodeFailureReason::FaceCroppingFailure]),
                1003 => Ok(vec![IncodeFailureReason::FaceCroppingFailure]),
                3002 => Ok(vec![IncodeFailureReason::FaceCroppingFailure]),
                3004 => Ok(vec![IncodeFailureReason::FaceCroppingFailure]),
                3005 => Ok(vec![IncodeFailureReason::FaceCroppingFailure]),
                3006 => Ok(vec![IncodeFailureReason::SelfieBlurry]),
                3007 => Ok(vec![IncodeFailureReason::SelfieGlare]),
                3008 => Ok(vec![IncodeFailureReason::SelfieImageSizeUnsupported]),
                3009 => Ok(vec![IncodeFailureReason::SelfieImageOrientationIncorrect]),
                3010 => Ok(vec![IncodeFailureReason::SelfieBadImageCompression]),
                500 => Ok(vec![IncodeFailureReason::UnexpectedErrorOccurred]),
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
        _: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        let result = TransitionResult {
            next_state: ProcessFace::new(),
            failure_reasons: self.failure_reasons,
            side: Some(DocumentSide::Selfie),
        };
        Ok(result)
    }
}
