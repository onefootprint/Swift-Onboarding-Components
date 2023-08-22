use super::{
    map_to_api_err, save_incode_verification_result, AddBack, AddSideResponseHelper, IncodeStateTransition,
    ProcessId, SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::{state::StateResult, IncodeContext};
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};

use idv::incode::doc::IncodeAddFrontRequest;

use newtypes::{DocVData, DocumentSide, IncodeFailureReason, VendorAPI};

pub struct AddFront {
    add_side_response_helper: AddSideResponseHelper,
}

#[async_trait]
impl IncodeStateTransition for AddFront {
    /// Initializes a state of this type, performing all async operations needed before the atomic
    /// bookkeeping and state transition.
    /// If None is returned, the state is not ready to run
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
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
        let res = clients.incode_add_front.make_request(request).await;

        // Save our result

        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeAddFront, ctx);
        save_incode_verification_result(db_pool, args).await?;

        let response = res.map_err(map_to_api_err)?.result;

        let (type_of_id, country_code, failure_reasons_from_response, failure_reasons_from_api_error) =
            match response.into_success() {
                // Incode returns 200 for upload failures, so catch these here
                Ok(response) => Ok((
                    response.type_of_id.clone(),
                    response.country_code.clone(),
                    response.failure_reasons(),
                    vec![],
                )),
                // status is a mix of custom error codes and http status codes
                Err(idv::incode::error::Error::APIResponseError(e)) => {
                    let failure_reasons = match e.status {
                        4019 => Ok(vec![IncodeFailureReason::SelfieFaceNotFound]),
                        1003 => Ok(vec![IncodeFailureReason::FaceCroppingFailure]),
                        500 => Ok(vec![IncodeFailureReason::UnexpectedErrorOccurred]),
                        // TODO there are probably more retryable errors in here
                        _ => Err(idv::incode::error::Error::APIResponseError(e)),
                    }
                    .map_err(map_to_api_err)?;

                    Ok((None, None, vec![], failure_reasons))
                }
                Err(e) => Err(e),
            }
            .map_err(map_to_api_err)?;

        Ok(Some(Self {
            add_side_response_helper: AddSideResponseHelper {
                type_of_id,
                country_code,
                failure_reasons_from_response,
                failure_reasons_from_api_error,
            },
        }))
    }

    /// Perform any bookkeeping that must be atomic with the state transition. Can access any
    /// context created in `init`
    fn transition(
        self,
        _: &mut TxnPgConn,
        ctx: &IncodeContext,
        _session: &VerificationSession,
    ) -> ApiResult<StateResult> {
        // Ensure we've gotten a doc we can support
        let type_of_id = self.add_side_response_helper.type_of_id.as_ref();
        let country_code = self.add_side_response_helper.country_code.as_ref();

        let mismatch_reason = if self.add_side_response_helper.has_api_error() {
            None
        } else {
            super::parse_type_of_id(ctx, type_of_id, country_code)?.err()
        };
        let mut failure_reasons = self.add_side_response_helper.failure_reasons();
        if let Some(reason) = mismatch_reason {
            failure_reasons.push(reason);
        }
        if !failure_reasons.is_empty() {
            return Ok(StateResult::Retry {
                next_state: Self::new(),
                reasons: failure_reasons,
                clear_sides: vec![DocumentSide::Front],
            });
        }

        let next_state = should_collect_back_or_process_id(&ctx.docv_data)?;
        Ok(next_state.into())
    }
}

fn should_collect_back_or_process_id(docv_data: &DocVData) -> ApiResult<IncodeState> {
    let doc_type = docv_data.document_type.ok_or(UserError::NoDocumentType)?;
    let next = if doc_type.sides().contains(&DocumentSide::Back) {
        AddBack::new()
    } else {
        ProcessId::new()
    };

    Ok(next)
}
