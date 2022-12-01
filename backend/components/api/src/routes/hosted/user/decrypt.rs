use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::utils::uvw_decryption::DecryptFieldsResult;
use crate::State;
use newtypes::DataAttribute;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use std::collections::HashMap;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    attributes: Vec<DataAttribute>,
}

type UserDecryptResponse = HashMap<DataAttribute, Option<String>>;

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
    let required_scope = if request.attributes.contains(&DataAttribute::Ssn9) {
        UserAuthScope::ExtendedProfile
    } else {
        UserAuthScope::BasicProfile
    };
    let user_auth = user_auth.check_permissions(vec![required_scope])?;
    let user_vault = user_auth.user_vault(&state.db_pool).await?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let user_vault_wrapper = UserVaultWrapper::build(conn, user_vault)?;

            Ok(user_vault_wrapper)
        })
        .await??;

    // TODO: implement decryption of user's own identity documents
    let DecryptFieldsResult {
        decrypted_data_attributes: _,
        result_map,
    } = uvw
        .decrypt_data_attributes(&state, request.attributes.clone())
        .await?;

    let result_map = result_map
        .into_iter()
        .map(|(k, v)| (k, v.map(|x| x.leak_to_string())))
        .collect();
    Ok(Json(ResponseData { data: result_map }))
}
