use crate::auth::session_data::user::UserAuthScope;
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::errors::ApiError;
use crate::hosted::user::decrypt;
use crate::hosted::user::DecryptFieldsResult;
use crate::types::response::ApiResponseData;
use crate::State;
use newtypes::DataAttribute;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::HashMap;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    attributes: Vec<DataAttribute>,
}

type UserDecryptResponse = HashMap<DataAttribute, Option<String>>;

#[api_v2_operation(
    summary = "/hosted/user/decrypt",
    operation_id = "hosted-user-decrypt",
    tags(Hosted),
    description = "Allows a user to decrypt their own data. Requires user auth provided in the header."
)]
#[post("/decrypt")]
fn handler(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let required_scope = if request.attributes.contains(&DataAttribute::Ssn9) {
        UserAuthScope::ExtendedProfile
    } else {
        UserAuthScope::BasicProfile
    };
    let user_auth = user_auth.check_permissions(vec![required_scope])?;

    let DecryptFieldsResult {
        decrypted_data_attributes: _,
        result_map,
    } = decrypt(
        &state,
        user_auth.user_vault(&state.db_pool).await?,
        request.attributes.clone(),
    )
    .await?;

    let result_map = result_map
        .into_iter()
        .map(|(k, v)| (k, v.map(|x| x.leak_to_string())))
        .collect();
    Ok(Json(ApiResponseData { data: result_map }))
}
