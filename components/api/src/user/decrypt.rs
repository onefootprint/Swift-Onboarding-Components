use crate::errors::ApiError;
use crate::tenant::decrypt::decrypt_fields;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{
    auth::logged_in_session::LoggedInSessionContext, tenant::decrypt::DecryptFieldsResult,
};
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::HashMap;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    attributes: Vec<DataKind>,
}

type UserDecryptResponse = HashMap<DataKind, String>;

#[api_v2_operation(tags(User))]
#[post("/decrypt")]
/// Allows a user to decrypt their own data.
/// Requires user auth provided in the cookie.
fn handler(
    state: web::Data<State>,
    user_auth: LoggedInSessionContext,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let vault = user_auth.user_vault();

    let DecryptFieldsResult {
        fields_to_decrypt: _,
        result_map,
    } = decrypt_fields(&state, request.attributes.clone(), vault).await?;

    Ok(Json(ApiResponseData {
        data: result_map,
    }))
}
