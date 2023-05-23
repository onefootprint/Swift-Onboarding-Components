mod start_onboarding;
use db::models::verification_request::VerificationRequest;
pub use start_onboarding::*;

mod add_consent;
pub use add_consent::*;

mod add_front;
pub use add_front::*;

mod add_back;
pub use add_back::*;

mod process_id;
pub use process_id::*;

mod fetch_scores;
pub use fetch_scores::*;

mod fetch_ocr;
pub use fetch_ocr::*;

mod complete;
pub use complete::*;

mod retry_upload;
pub use retry_upload::*;

use super::incode_state_machine::{IncodeContext, IncodeState, IncodeStateTransition};
use crate::decision::vendor::verification_result::encrypt_verification_result_response;
use crate::errors::ApiResult;
use crate::ApiError;
use db::models::verification_result::VerificationResult;
use db::DbPool;
use idv::incode::{APIResponseToIncodeError, IncodeResponse};
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{IncodeVerificationSessionId, ScrubbedJsonValue, VendorAPI};

#[derive(Clone)]
pub struct VerificationSession {
    pub id: IncodeVerificationSessionId,
    pub credentials: IncodeCredentialsWithToken,
}

/// Struct to make sure we handle the different cases of Incode vendor call errors we may see
struct SaveVerificationResultArgs<'a> {
    is_error: bool,
    raw_response: serde_json::Value,
    scrubbed_response: ScrubbedJsonValue,
    vendor_api: VendorAPI,
    ctx: &'a IncodeContext,
}

impl<'a> SaveVerificationResultArgs<'a> {
    fn from<T: APIResponseToIncodeError + serde::Serialize>(
        request_result: &'a Result<IncodeResponse<T>, idv::incode::error::Error>,
        vendor_api: VendorAPI,
        ctx: &'a IncodeContext,
    ) -> Self {
        // We need to handle saving if
        // 1) if the Incode call fails (for some reason)
        // 2) if the Incode response succeeds but there's an error returned
        match request_result {
            Ok(response) => {
                let is_error = response.result.is_error();
                let raw_response = response.raw_response.clone();
                let scrubbed_response = response
                    .result
                    .scrub()
                    .map_err(map_to_api_err)
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    is_error,
                    raw_response,
                    scrubbed_response,
                    vendor_api,
                    ctx,
                }
            }
            Err(_) => Self {
                is_error: true,
                raw_response: serde_json::json!(""),
                scrubbed_response: serde_json::json!("").into(),
                vendor_api,
                ctx,
            },
        }
    }
}

async fn save_incode_verification_result<'a>(
    db_pool: &DbPool,
    args: SaveVerificationResultArgs<'a>,
) -> ApiResult<VerificationResult> {
    let SaveVerificationResultArgs {
        scrubbed_response,
        raw_response,
        is_error,
        vendor_api,
        ctx,
    } = args;
    let e_response = encrypt_verification_result_response(&raw_response.into(), &ctx.vault.public_key)?;
    let sv_id = ctx.sv_id.clone();
    let id_doc_id = ctx.id_doc_id.clone();
    let di_id = ctx.di_id.clone();
    let result = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // This is interesting - we make the VReq and VRes at the same time.
            // In other vendor APIs, the only bookkeeping we have for an outstanding vendor request
            // is a VReq without a VRes - for the document workflow, we have the incode state
            // machine that tells us what state we're in.
            let req = VerificationRequest::create_document_verification_request(
                conn, vendor_api, sv_id, id_doc_id, &di_id,
            )?;
            let res = VerificationResult::create(conn, req.id, scrubbed_response, e_response, is_error)?;

            Ok(res)
        })
        .await?;
    Ok(result)
}

fn map_to_api_err(e: idv::incode::error::Error) -> ApiError {
    ApiError::from(idv::Error::from(e))
}
