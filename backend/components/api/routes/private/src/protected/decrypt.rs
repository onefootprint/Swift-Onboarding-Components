use crate::State;
use api_core::decision::vendor;
use api_core::{
    auth::tenant::{CheckTenantGuard, FirmEmployeeAuthContext, TenantGuard},
    types::{JsonApiResponse, ResponseData},
    ApiError,
};
use db::models::{
    vault::Vault, verification_request::VerificationRequest, verification_result::VerificationResult,
};
use db::DbResult;
use newtypes::{PiiJsonValue, VerificationResultId};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Apiv2Schema, serde::Deserialize)]
pub struct DecryptVresRequest {
    vres_id: VerificationResultId,
}

#[derive(Debug, Apiv2Schema, serde::Serialize)]
pub struct DecryptVresResponse {
    vres_id: VerificationResultId,
    decrypted_e_response: PiiJsonValue,
}

#[api_v2_operation(
    description = "Decrypts the e_response for a verification_result",
    tags(Private)
)]
#[post("/private/protected/decrypt_vres_response")]
pub async fn post(
    state: web::Data<State>,
    request: Json<DecryptVresRequest>,
    auth: FirmEmployeeAuthContext,
) -> JsonApiResponse<DecryptVresResponse> {
    // Basically, make sure only "Risk ops" employees can hit this API
    auth.check_guard(TenantGuard::ManualReview)?;

    let DecryptVresRequest { vres_id } = request.into_inner();

    let (vres, uv) = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let vres = VerificationResult::get(conn, &vres_id)?;
            let vreq = VerificationRequest::get(conn, &vres.request_id)?;
            let uv = Vault::get(conn, &vreq.scoped_vault_id)?;

            Ok((vres, uv))
        })
        .await??;

    let decrypted_e_response = vendor::verification_result::decrypt_verification_result_response(
        &state.enclave_client,
        vec![vres
            .e_response
            .ok_or(ApiError::AssertionError("e_response is None".to_owned()))?],
        &uv.e_private_key,
    )
    .await?
    .pop()
    .ok_or(ApiError::AssertionError(
        "decrypt_verification_result_response returned empty list".to_owned(),
    ))?;

    let response = DecryptVresResponse {
        vres_id: vres.id,
        decrypted_e_response,
    };
    ResponseData::ok(response).json()
}
