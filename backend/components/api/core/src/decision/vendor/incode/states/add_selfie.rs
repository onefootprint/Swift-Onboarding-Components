use super::AddConsent;
use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::state::TransitionResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::map_to_api_error;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::DbPool;
use db::TxnPgConn;
use either::Either;
use idv::incode::doc::IncodeAddSelfieRequest;
use newtypes::DocVData;
use newtypes::DocumentSide;
use newtypes::IncodeFailureReason;
use newtypes::PiiString;
use newtypes::VendorAPI;

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

        let failure_reasons = match add_selfie_inner(db_pool, clients, ctx, session, selfie_image).await {
            Ok(reasons) => Ok(reasons),
            Err(err) => {
                tracing::error!(?err, selfie_disabled = ctx.disable_selfie, "error adding selfie");

                if ctx.disable_selfie {
                    Ok(vec![])
                } else {
                    Err(err)
                }
            }
        }?;

        Ok(Some(Self { failure_reasons }))
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _ctx: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        let result = TransitionResult {
            failure_reasons: self.failure_reasons,
            side: Some(DocumentSide::Selfie),
        };
        Ok(result)
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        AddConsent::new()
    }
}

async fn add_selfie_inner(
    db_pool: &DbPool,
    clients: &IncodeClients,
    ctx: &IncodeContext,
    session: &VerificationSession,
    selfie_image: PiiString,
) -> ApiResult<Vec<IncodeFailureReason>> {
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
    args.save(db_pool).await?;

    // Now ensure we don't have an error
    let response = request_result.map_err(map_to_api_error)?.result;

    let failure_reasons = match response.safe_into_success() {
        // Incode returns 200 for upload failures, so catch these here
        Either::Left(response) => response.failure_reasons(),
        Either::Right(failure_reasons) => {
            failure_reasons.unwrap_or(vec![IncodeFailureReason::UnexpectedErrorOccurred])
        }
    };

    Ok(failure_reasons)
}
