use crate::auth::session_data::user::UserAuthScope;
use crate::auth::AuthError;
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::errors::ApiError;
use crate::internal::user::decrypt;
use crate::internal::user::DecryptFieldsResult;
use crate::types::success::ApiResponseData;
use crate::State;
use db::models::user_data::UserData;
use newtypes::DataKind;
use newtypes::UserDataId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::HashMap;

use super::decrypt_data;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequestV1 {
    attributes: Vec<DataKind>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequestV2 {
    user_data_ids: Vec<UserDataId>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(untagged)]
enum UserDecryptRequest {
    V1(UserDecryptRequestV1),
    V2(UserDecryptRequestV2),
}

type UserDecryptResponseV1 = HashMap<DataKind, Option<String>>;

type UserDecryptResponseV2 = HashMap<UserDataId, String>;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(untagged)]
enum UserDecryptResponse {
    V1(UserDecryptResponseV1),
    V2(UserDecryptResponseV2),
}

#[api_v2_operation(tags(User))]
#[post("/decrypt")]
/// Allows a user to decrypt their own data.
/// Requires user auth provided in the cookie.
fn handler(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    match request.into_inner() {
        UserDecryptRequest::V1(request) => decrypt_v1(state, user_auth, request).await,
        UserDecryptRequest::V2(request) => decrypt_v2(state, user_auth, request).await,
    }
}

async fn decrypt_v1(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: UserDecryptRequestV1,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let required_scope = if request.attributes.contains(&DataKind::Ssn) {
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
    Ok(Json(ApiResponseData {
        data: UserDecryptResponse::V1(result_map),
    }))
}

async fn decrypt_v2(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: UserDecryptRequestV2,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let user_datas = state
        .db_pool
        .db_query(|conn| UserData::list(conn, request.user_data_ids))
        .await??;
    // Make sure we have permissions to decrypt these attributes
    let required_scope = if user_datas.iter().any(|x| x.data_kind == DataKind::Ssn) {
        UserAuthScope::ExtendedProfile
    } else {
        UserAuthScope::BasicProfile
    };
    let user_auth = user_auth.check_permissions(vec![required_scope])?;

    // Make sure the user owns all of these pieces of data
    let user_vault_id = user_auth.user_vault_id();
    if user_datas.iter().any(|x| x.user_vault_id != user_vault_id) {
        // TODO what kind of error should we return here?
        // Really, we should just filter out user_data_ids that don't belong to the authed user
        return Err(AuthError::UnauthorizedOperation.into());
    }

    let user_vault = user_auth.user_vault(&state.db_pool).await?;
    let results: HashMap<_, _> = decrypt_data(&state, &user_vault.e_private_key, user_datas)
        .await?
        .into_iter()
        .map(|(id, _, pii)| (id, pii.leak_to_string()))
        .collect();

    Ok(Json(ApiResponseData {
        data: UserDecryptResponse::V2(results),
    }))
}
