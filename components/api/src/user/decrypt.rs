use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::tenant::types::UserVaultFieldKind;
use crate::types::success::ApiResponseData;
use crate::State;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    attributes: HashSet<UserVaultFieldKind>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptResponse {
    pub attributes: HashMap<UserVaultFieldKind, Option<String>>,
}

#[api_v2_operation]
#[post("/decrypt")]
/// Allows a user to decrypt their own data.
/// Requires user auth provided in the cookie.
fn handler(
    state: web::Data<State>,
    user_auth: LoggedInSessionContext,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let vault = user_auth.user_vault();

    let mut map = HashMap::new();
    for attr in &request.attributes {
        let val = crate::tenant::decrypt::decrypt_field(&state, attr, vault.clone()).await?;
        map.insert(attr.to_owned(), val);
    }

    Ok(Json(ApiResponseData {
        data: UserDecryptResponse { attributes: map },
    }))
}
