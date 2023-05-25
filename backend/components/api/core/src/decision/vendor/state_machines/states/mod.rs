mod start_onboarding;

use db::models::document_upload::DocumentUpload;
use db::models::user_timeline::UserTimeline;
use db::models::verification_request::VerificationRequest;
use itertools::Itertools;
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

use super::incode_state_machine::IncodeContext;
use super::state::{IncodeState, IncodeStateTransition};
use crate::decision::vendor::verification_result::encrypt_verification_result_response;
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::ApiError;
use db::models::verification_result::VerificationResult;
use db::{DbPool, TxnPgConn};
use idv::incode::{APIResponseToIncodeError, IncodeResponse};
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{
    DocVData, DocumentSide, IdentityDocumentUploadedInfo, IncodeVerificationSessionId,
    IncodeVerificationSessionKind, PiiJsonValue, ScrubbedJsonValue, VendorAPI,
};

#[derive(Clone)]
pub struct VerificationSession {
    pub id: IncodeVerificationSessionId,
    pub kind: IncodeVerificationSessionKind,
    pub credentials: IncodeCredentialsWithToken,
}

/// Struct to make sure we handle the different cases of Incode vendor call errors we may see
struct SaveVerificationResultArgs<'a> {
    is_error: bool,
    raw_response: PiiJsonValue,
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
                raw_response: serde_json::json!("").into(),
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
    let e_response = encrypt_verification_result_response(&raw_response, &ctx.vault.public_key)?;
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

fn on_upload_fail(conn: &mut TxnPgConn, ctx: &IncodeContext, sides: Vec<DocumentSide>) -> ApiResult<()> {
    // TODO implement retry limit
    // TODO Change the appearance of this timeline event. Do we want to show _every_ fail?
    // If so, right now we are not including any info on the state of the upload since we link
    // to a mutable object
    let info = IdentityDocumentUploadedInfo {
        id: ctx.id_doc_id.clone(),
    };
    UserTimeline::create(conn, info, ctx.vault.id.clone(), ctx.sv_id.clone())?;

    // Deactivate the failed sides to require re-uploading
    DocumentUpload::deactivate(conn, &ctx.id_doc_id, sides)?;
    Ok(())
}

fn next_side_to_collect(
    current_side: DocumentSide,
    docv_data: &DocVData,
    session: &VerificationSession,
) -> ApiResult<IncodeState> {
    let doc_type = docv_data.document_type.ok_or(UserError::NoDocumentType)?;
    let required_sides = doc_type
        .sides()
        .into_iter()
        .chain(session.kind.requires_selfie().then_some(DocumentSide::Selfie))
        .collect_vec();

    // Hardcode the order since we can't trust above
    let next_side_to_collect = vec![DocumentSide::Front, DocumentSide::Back, DocumentSide::Selfie]
        .into_iter()
        .filter(|s| required_sides.contains(s))
        .collect_vec()
        .windows(2)
        .find(|s| s[0] == current_side)
        .map(|s| s[1]);

    let next = match next_side_to_collect {
        // Should never happen
        Some(DocumentSide::Front) => AddFront::new(),
        Some(DocumentSide::Back) => AddBack::new(),
        Some(DocumentSide::Selfie) => AddConsent::new(), // AddConsent goes to AddSelfie
        // No next side to collect, move on to scores
        None => ProcessId::new(),
    };
    Ok(next)
}
