use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;

use chrono::Utc;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(description = "Checks that the api key is OK", tags(Organization))]
#[get("/org/api_keys/check")]
async fn get(
    _state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ResponseData<api_wire_types::SecretApiKey>>, ApiError> {
    let response = api_wire_types::SecretApiKey::from_db((auth.api_key().clone(), None, Some(Utc::now())));
    Ok(Json(ResponseData::ok(response)))
}
