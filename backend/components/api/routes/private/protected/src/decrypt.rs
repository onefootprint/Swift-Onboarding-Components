use api_core::State;

use actix_web::{post, web, web::Json};
use api_core::{
    decision::vendor,
    types::{JsonApiResponse, ResponseData},
    ApiErrorKind,
};
use db::{
    models::{vault::Vault, verification_result::VerificationResult},
    DbResult,
};
use newtypes::{PiiJsonValue, VerificationResultId};

use crate::ProtectedAuth;

#[derive(Debug, serde::Deserialize)]
pub struct DecryptVresRequest {
    vres_id: VerificationResultId,
}

#[derive(Debug, serde::Serialize)]
pub struct DecryptVresResponse {
    vres_id: VerificationResultId,
    decrypted_e_response: PiiJsonValue,
}

#[post("/private/protected/decrypt_vres_response")]
pub async fn post(
    state: web::Data<State>,
    request: Json<DecryptVresRequest>,
    _: ProtectedAuth,
) -> JsonApiResponse<DecryptVresResponse> {
    let DecryptVresRequest { vres_id } = request.into_inner();

    let (vres, uv) = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let (vreq, vres) = VerificationResult::get(conn, &vres_id)?;
            let uv = Vault::get(conn, &vreq.scoped_vault_id)?;

            Ok((vres, uv))
        })
        .await?;

    let decrypted_e_response = vendor::verification_result::decrypt_verification_result_response(
        &state.enclave_client,
        vec![vres
            .e_response
            .ok_or(ApiErrorKind::AssertionError("e_response is None".to_owned()))?],
        &uv.e_private_key,
    )
    .await?
    .pop()
    .ok_or(ApiErrorKind::AssertionError(
        "decrypt_verification_result_response returned empty list".to_owned(),
    ))?;

    let response = DecryptVresResponse {
        vres_id: vres.id,
        decrypted_e_response,
    };
    ResponseData::ok(response).json()
}
