use super::{
    map_to_api_err, save_incode_verification_result, AddFront, Complete, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use crate::decision::vendor::incode::{state::StateResult, IncodeContext};
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::{TenantVw, VaultWrapper};
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::incode::doc::response::{FetchOCRResponse, FetchScoresResponse};
use idv::incode::doc::{IncodeFetchOCRRequest, IncodeFetchScoresRequest};
use newtypes::{DataIdentifier, DocumentSide, IdentityDataKind, VendorAPI, VerificationResultId};
use strum::IntoEnumIterator;

pub struct FetchScores {
    ocr_response: FetchOCRResponse,
    score_response: FetchScoresResponse,
    vault_data: IncodeOcrComparisonDataFields,
    score_verification_result_id: VerificationResultId,
    ocr_verification_result_id: VerificationResultId,
}

#[async_trait]
impl IncodeStateTransition for FetchScores {
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        // make the request to incode
        let request = IncodeFetchScoresRequest {
            credentials: session.credentials.clone(),
        };
        let scores_res = clients.incode_fetch_scores.make_request(request).await;

        // Save our result
        let score_args = SaveVerificationResultArgs::from(&scores_res, VendorAPI::IncodeFetchScores, ctx);
        let score_vres = save_incode_verification_result(db_pool, score_args).await?;

        // Now ensure we don't have an error
        let score_response = scores_res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        // we need an overall score or else we should fail
        score_response.overall_score().map_err(map_to_api_err)?;

        // There's a really annoying/subtle thing with the incode API:
        //    if you don't have selfie enabled in the incode flow builder, it will gladly allow you to send selfie image, it just silently doesn't include the selfie in the actual score/result
        // So let's assert here that we have gotten back a score
        if session.kind.requires_selfie() {
            score_response.selfie_match().map_err(map_to_api_err)?;
        }

        // make the OCR to incode
        let ocr_request = IncodeFetchOCRRequest {
            credentials: session.credentials.clone(),
        };
        let ocr_res = clients.incode_fetch_ocr.make_request(ocr_request).await;

        // Save our result
        let ocr_args = SaveVerificationResultArgs::from(&ocr_res, VendorAPI::IncodeFetchOCR, ctx);
        let ocr_vres = save_incode_verification_result(db_pool, ocr_args).await?;

        // Now ensure we don't have an error
        let ocr_response = ocr_res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        // Set up reason codes
        let sv_id = ctx.sv_id.clone();
        let uvw: TenantVw = db_pool
            .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sv_id))
            .await??;
        let vd = uvw
            .decrypt_unchecked(
                &ctx.enclave_client,
                &[
                    DataIdentifier::Id(IdentityDataKind::FirstName),
                    DataIdentifier::Id(IdentityDataKind::LastName),
                    DataIdentifier::Id(IdentityDataKind::Dob),
                    // TODO: address
                ],
            )
            .await?;

        let vault_data = IncodeOcrComparisonDataFields {
            first_name: vd.get_di(IdentityDataKind::FirstName)?,
            last_name: vd.get_di(IdentityDataKind::LastName)?,
            dob: vd.get_di(IdentityDataKind::Dob)?,
        };

        Ok(Some(Self {
            score_response,
            ocr_response,
            vault_data,
            score_verification_result_id: score_vres.id,
            ocr_verification_result_id: ocr_vres.id,
        }))
    }

    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<StateResult> {
        let type_of_id = self.ocr_response.type_of_id.as_ref();
        let country_code = self.ocr_response.issuing_country.as_ref();
        match super::parse_type_of_id(ctx, type_of_id, country_code)? {
            Ok(dk) => {
                // TODO could represent enter inside the state transition
                Complete::enter(
                    conn,
                    &ctx.vault,
                    &ctx.sv_id,
                    &ctx.id_doc_id,
                    dk,
                    self.ocr_response,
                    self.score_response,
                    self.vault_data,
                    session.kind.requires_selfie(),
                    self.ocr_verification_result_id,
                    self.score_verification_result_id,
                )?;
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
