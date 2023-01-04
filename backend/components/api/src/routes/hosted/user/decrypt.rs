use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::errors::ApiError;
use crate::hosted::user::decrypt;
use crate::hosted::user::DecryptFieldsResult;
use crate::types::response::ResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use newtypes::DataLifetimeKind;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use std::collections::HashMap;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    attributes: Vec<DataLifetimeKind>,
}

type UserDecryptResponse = HashMap<DataLifetimeKind, Option<String>>;

#[api_v2_operation(
    tags(Hosted),
    description = "Allows a user to decrypt their own data. Requires user auth provided in the header."
)]
#[actix::post("/hosted/user/decrypt")]
fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ResponseData<UserDecryptResponse>>, ApiError> {
    let required_scope = if request.attributes.contains(&DataLifetimeKind::Ssn9) {
        UserAuthScope::ExtendedProfile
    } else {
        UserAuthScope::BasicProfile
    };
    let user_auth = user_auth.check_permissions(vec![required_scope])?;
    let user_vault = user_auth.user_vault(&state.db_pool).await?;
    let uv_id = user_vault.id.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::build_for_user(conn, &uv_id))
        .await??;

    let DecryptFieldsResult {
        decrypted_data_attributes: _,
        result_map,
    } = decrypt(&state, &uvw, request.attributes.clone()).await?;

    let result_map = result_map
        .into_iter()
        .map(|(k, v)| (k, v.map(|x| x.leak_to_string())))
        .collect();
    Ok(Json(ResponseData { data: result_map }))
}
