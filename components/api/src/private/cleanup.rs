use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::State;
use crate::{errors::ApiError, utils::phone::clean_phone_number};
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(tags(Private))]
#[post("/cleanup")]
/// Private endpoint to clean up specific integration test user information
async fn post(state: web::Data<State>) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let integration_test_number = &state.config.integration_test_phone_number;
    let clean_number = clean_phone_number(&state, integration_test_number).await?;
    let sh_data = state.hmac_client.signed_hash(clean_number.as_bytes()).await?;
    db::private_cleanup_integration_tests(&state.db_pool, sh_data).await?;

    Ok(Json(ApiResponseData { data: Empty }))
}
