use crate::auth::session_data::user::UserAuthScope;
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::errors::ApiError;
use crate::hosted::user::decrypt;
use crate::hosted::user::DecryptFieldsResult;
use crate::types::response::ApiResponseData;
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
    user_auth: UserAuth,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let required_scope = if request.attributes.contains(&DataKind::Ssn9) {
        UserAuthScope::ExtendedProfile
    } else {
        UserAuthScope::BasicProfile
    };
    let user_auth = user_auth.check_permissions(vec![required_scope])?;

    let DecryptFieldsResult {
        decrypted_data_kinds: _,
        result_map,
    } = decrypt(
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
