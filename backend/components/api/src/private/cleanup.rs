use crate::auth::custodian::CustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use newtypes::{DataAttribute, Fingerprinter};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use std::str::FromStr;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct PhoneNumber {
    phone_number: newtypes::PhoneNumber,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct CleanupResponse {
    num_deleted_rows: usize,
}

#[api_v2_operation(
    summary = "/private/cleanup",
    operation_id = "private-cleanup",
    description = "Private endpoint to clean up specific integration test user information.",
    tags(Private)
)]
#[post("/cleanup")]
async fn post(
    state: web::Data<State>,
    _custodian: CustodianAuthContext,
    request: web::Json<PhoneNumber>,
) -> actix_web::Result<Json<ResponseData<CleanupResponse>>, ApiError> {
    // allowed deletion #s
    let allowed_deletion_numbers: Vec<newtypes::PhoneNumber> = vec![
        "16504600700",    // belce
        "14259844138",    // elliott
        "16178408644",    // alex
        "16173839084",    // alex2
        "4917629716301",  // rafa
        "16106807897",    // eli
        "+5561999771150", // pedro
        "+15045007931",   // omar
    ]
    .into_iter()
    .map(newtypes::PhoneNumber::from_str)
    .collect::<Result<Vec<_>, _>>()?;

    let requested_number = request.phone_number.clone();

    if !(allowed_deletion_numbers.contains(&requested_number)
        || requested_number == state.config.integration_test_phone_number
        || requested_number.leak().split('#').next()
            == Some(state.config.integration_test_phone_number.leak()))
    {
        return Err(ApiError::NotImplemented);
    }
    let twilio_client = &state.twilio_client;
    let phone_number = twilio_client.standardize(&requested_number).await?;
    let sh_data = state
        .compute_fingerprint(DataAttribute::PhoneNumber, phone_number.to_piistring())
        .await?;
    let num_deleted_rows = db::private_cleanup_integration_tests(&state.db_pool, sh_data).await?;

    Ok(Json(ResponseData::ok(CleanupResponse { num_deleted_rows })))
}
