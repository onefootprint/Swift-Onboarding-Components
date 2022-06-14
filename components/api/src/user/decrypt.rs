use crate::auth::session_context::SessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::user::decrypt;
use crate::user::DecryptFieldsResult;
use crate::State;
use newtypes::user::onboarding::OnboardingSession;
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
    // todo, this should take 1fp
    user_auth: SessionContext<OnboardingSession>,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let DecryptFieldsResult {
        fields_to_decrypt: _,
        result_map,
    } = decrypt(
        user_auth.data.clone(),
        &state,
        user_auth.user_vault(&state.db_pool).await?,
        request.attributes.clone(),
    )
    .await?;

    Ok(Json(ApiResponseData { data: result_map }))
}
