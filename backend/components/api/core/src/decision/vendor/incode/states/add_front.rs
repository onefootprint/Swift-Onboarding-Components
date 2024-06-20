use super::AddBack;
use super::AddConsent;
use super::AddSelfie;
use super::AddSideResponseHelper;
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
use idv::incode::doc::IncodeAddFrontRequest;
use newtypes::DocVData;
use newtypes::DocumentKind;
use newtypes::DocumentSide;
use newtypes::IncodeFailureReason;
use newtypes::VendorAPI;

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
        args.save(db_pool).await?;

        let response = res.map_err(map_to_api_error)?.result;

        let (
            type_of_id,
            document_subtype,
            country_code,
            failure_reasons_from_response,
            failure_reasons_from_api_error,
        ) = match response.safe_into_success() {
            // Incode returns 200 for upload failures, so catch these here
            Either::Left(response) => (
                response.type_of_id.clone(),
                response.document_sub_type().clone(),
                response.country_code.clone(),
                // TODO add restrictions from OBC
                response.failure_reasons(AddSideResponseHelper::get_restrictions(
                    &ctx.tenant_id,
                    ctx.ff_client.clone(),
                    ctx.failed_attempts_for_side,
                )),
                vec![],
            ),
            // status is a mix of custom error codes and http status codes
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

    /// Perform any bookkeeping that must be atomic with the state transition. Can access any
    /// context created in `init`
    fn transition(
        self,
        _: &mut TxnPgConn,
        ctx: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        // Ensure we've gotten a doc we can support
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
            side: Some(DocumentSide::Front),
        };
        Ok(result)
    }

    fn next_state(session: &VerificationSession) -> IncodeState {
        if DocumentKind::from(session.document_type)
            .sides()
            .contains(&DocumentSide::Back)
        {
            AddBack::new()
        } else if session.kind.requires_selfie() {
            AddSelfie::new()
        } else {
            AddConsent::new()
        }
    }
}
