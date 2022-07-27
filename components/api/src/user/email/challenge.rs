use std::str::FromStr;

use crate::auth::session_context::UserAuth;
use crate::auth::{session_context::HasUserVaultId, session_data::user::UserAuthScope};
use crate::errors::challenge::ChallengeError;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::utils::email::send_email_challenge;
use crate::State;
use db::models::user_data::UserData;
use newtypes::email::Email;
use newtypes::UserDataId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct RequestEmailVerifyRequest {
    id: UserDataId,
}

#[api_v2_operation(tags(User))]
#[post("/challenge")]
/// Re-send the email verification email for the given user data
async fn post(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: Json<RequestEmailVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    user_auth.enforce_has_any(vec![UserAuthScope::BasicProfile])?;

    let (user_data, user_vault) = state
        .db_pool
        .db_query(move |conn| UserData::get(conn, &request.id, &user_auth.user_vault_id()))
        .await??;
    if user_data.is_verified {
        return Err(ChallengeError::EmailAlreadyVerified.into());
    }
    let email = crate::enclave::decrypt_bytes(
        &state,
        &user_data.e_data,
        &user_vault.e_private_key,
        enclave_proxy::DataTransform::Identity,
    )
    .await?;
    let email = Email::from_str(email.leak())?;

    send_email_challenge(&state, user_data.id, &email.email).await?;

    Ok(Json(ApiResponseData::ok(Empty {})))
}
