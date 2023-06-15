use super::{
    map_to_api_err, save_incode_verification_result, AddFront, Complete, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::{state::StateResult, IncodeContext};
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::IncodeFetchOCRRequest;
use newtypes::{DocumentSide, VendorAPI};
use strum::IntoEnumIterator;

pub struct FetchOCR {
    response: FetchOCRResponse,
}

#[async_trait]
impl IncodeStateTransition for FetchOCR {
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        // make the request to incode
        let request = IncodeFetchOCRRequest {
            credentials: session.credentials.clone(),
        };
        let res = clients.incode_fetch_ocr.make_request(request).await;

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
        let type_of_id = self.response.type_of_id.as_ref();
        let country_code = self.response.issuing_country.as_ref();
        match super::parse_type_of_id(ctx, type_of_id, country_code)? {
            Ok(dk) => {
                // TODO could represent enter inside the state transition
                Complete::enter(conn, &ctx.vault, &ctx.sv_id, &ctx.id_doc_id, dk, self.response)?;
                Ok(Complete::new().into())
            }
            Err(reason) => Ok(StateResult::Retry {
                next_state: AddFront::new(),
                reasons: vec![reason],
                clear_sides: DocumentSide::iter().collect(),
            }),
        }
    }
}
