use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::user::decrypt;
use crate::State;
use crate::{auth::onboarding_session::OnboardingSessionContext, user::DecryptFieldsResult};
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
    user_auth: OnboardingSessionContext,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let vault = user_auth.user_vault();

    let DecryptFieldsResult {
        fields_to_decrypt: _,
        result_map,
    } = decrypt(
        user_auth.clone(),
        &state,
        vault.to_owned(),
        request.attributes.clone(),
    )
    .await?;

    Ok(Json(ApiResponseData { data: result_map }))
}
