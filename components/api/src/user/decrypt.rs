use crate::auth::session_context::HasUserVaultId;
use crate::auth::session_context::SessionContext;
use crate::auth::session_data::user::my_fp::My1fpBasicSession;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::user::decrypt;
use crate::user::DecryptFieldsResult;
use crate::State;
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::HashMap;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    attributes: Vec<DataKind>,
}

type UserDecryptResponse = HashMap<DataKind, Option<String>>;

#[api_v2_operation(tags(User))]
#[post("/decrypt")]
/// Allows a user to decrypt their own data.
/// Requires user auth provided in the cookie.
fn handler(
    state: web::Data<State>,
    user_auth: SessionContext<My1fpBasicSession>, // TODO: require stepup m1fp session here
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let DecryptFieldsResult {
        decrypted_data_kinds: _,
        result_map,
    } = decrypt(
        &user_auth,
        &state,
        user_auth.user_vault(&state.db_pool).await?,
        None,
        request.attributes.clone(),
    )
    .await?;

    let result_map = result_map
        .into_iter()
        .map(|(k, v)| (k, v.map(|x| x.leak_to_string())))
        .collect();
    Ok(Json(ApiResponseData { data: result_map }))
}
