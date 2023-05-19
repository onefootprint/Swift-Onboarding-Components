mod start_onboarding;
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

use super::incode_state_machine::{IncodeState, IncodeStateTransition};
use crate::decision::vendor::verification_result::encrypt_verification_result_response;
use crate::errors::ApiResult;
use crate::ApiError;
use db::models::verification_result::VerificationResult;
use db::DbPool;
use idv::incode::{APIResponseToIncodeError, IncodeResponse};
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{IncodeVerificationSessionId, ScrubbedJsonValue, VaultPublicKey, VerificationRequestId};

#[derive(Clone)]
pub struct VerificationSession {
    pub id: IncodeVerificationSessionId,
    pub credentials: IncodeCredentialsWithToken,
}

/// Struct to make sure we handle the different cases of Incode vendor call errors we may see
struct SaveVerificationResultArgs {
    pub is_error: bool,
    pub raw_response: serde_json::Value,
    pub scrubbed_response: ScrubbedJsonValue,
    pub verification_request_id: VerificationRequestId,
}

impl<T: APIResponseToIncodeError + serde::Serialize>
    From<(
        &Result<IncodeResponse<T>, idv::incode::error::Error>,
        VerificationRequestId,
    )> for SaveVerificationResultArgs
{
    fn from(
        value: (
            &Result<IncodeResponse<T>, idv::incode::error::Error>,
            VerificationRequestId,
        ),
    ) -> Self {
        let (request_result, verification_request_id) = value;
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
                    verification_request_id,
                }
            }
            Err(_) => Self {
                is_error: true,
                raw_response: serde_json::json!(""),
                scrubbed_response: serde_json::json!("").into(),
                verification_request_id,
            },
        }
    }
}

async fn save_incode_verification_result(
    db_pool: &DbPool,
    args: SaveVerificationResultArgs,
    user_vault_public_key: &VaultPublicKey,
) -> ApiResult<VerificationResult> {
    let uvk = user_vault_public_key.clone();

    db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let e_response = encrypt_verification_result_response(&args.raw_response.into(), &uvk)?;

            let res = VerificationResult::create(
                conn,
                args.verification_request_id,
                args.scrubbed_response,
                e_response,
                args.is_error,
            )?;

            Ok(res)
        })
        .await?
}

fn map_to_api_err(e: idv::incode::error::Error) -> ApiError {
    ApiError::from(idv::Error::from(e))
}
