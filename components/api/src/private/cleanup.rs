use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::State;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use std::str::FromStr;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct PhoneNumber {
    phone_number: newtypes::PhoneNumber,
}

#[api_v2_operation(tags(Private))]
#[post("/cleanup")]
/// Private endpoint to clean up specific integration test user information
async fn post(
    state: web::Data<State>,
    number: web::Query<PhoneNumber>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let requested_number = number.phone_number.clone();

    // allowed deletion #s
    let is_allowed = vec![
        "19196169455",    // gabbi
        "16504600700",    // belce
        "14259844138",    // elliott
        "16178408644",    // alex
        "4917629716301",  // rafa
        "16106807897",    //eli
        "+5561999771150", // pedro
    ]
    .into_iter()
    .map(|n| {
        newtypes::PhoneNumber::from_str(n)
            .map_err(ApiError::TypeDeserializationError)
            .unwrap()
    })
    .filter(|num| num.eq(&requested_number))
    .count();

    if !(is_allowed != 0 || requested_number == state.config.integration_test_phone_number) {
        return Ok(Json(ApiResponseData { data: Empty }));
    }
    let twilio_client = &state.twilio_client;
    let phone_number = twilio_client.standardize(requested_number.clone()).await?;
    let sh_data = state
        .hmac_client
        .signed_hash(phone_number.e164.as_bytes())
        .await?;
    db::private_cleanup_integration_tests(&state.db_pool, sh_data).await?;

    Ok(Json(ApiResponseData { data: Empty }))
}
