use crate::{errors::ApiError};
use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::State;
use newtypes::PhoneNumber;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(tags(Private))]
#[post("/cleanup")]
/// Private endpoint to clean up specific integration test user information
async fn post(state: web::Data<State>) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let integration_test_number = state.config.integration_test_phone_number.clone();
    let client = awc::Client::default();
    let twilio_client = &state.twilio_client;
    let phone_number = twilio_client.standardize(&client, integration_test_number).await?;
    let sh_data = state
        .hmac_client
        .signed_hash(phone_number.e164.as_bytes())
        .await?;
    db::private_cleanup_integration_tests(&state.db_pool, sh_data).await?;

    Ok(Json(ApiResponseData { data: Empty }))
}
