use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use crate::{auth::key_context::secret_key::SecretTenantAuthContext, types::secret_api_key::FpTenantApiKey};

use chrono::Utc;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(
    summary = "/org/api_keys/check",
    operation_id = "org-api_keys-check",
    description = "Checks that the api key is OK",
    tags(PublicApi)
)]
#[get("/check")]
async fn get(
    _state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ResponseData<FpTenantApiKey>>, ApiError> {
    let response = FpTenantApiKey::from((Some(Utc::now()), auth.api_key().clone()));
    Ok(Json(ResponseData::ok(response)))
}
