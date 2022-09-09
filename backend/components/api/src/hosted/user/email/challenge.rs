use std::str::FromStr;

use crate::auth::UserAuth;
use crate::auth::{session_data::user::UserAuthScope, VerifiedUserAuth};
use crate::errors::challenge::ChallengeError;
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::types::EmptyResponse;
use crate::utils::email::send_email_challenge;
use crate::State;
use db::models::email::Email;
use newtypes::email::Email as EmailData;
use newtypes::EmailId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct RequestEmailVerifyRequest {
    id: EmailId,
}

#[api_v2_operation(
    summary = "/hosted/user/email/challenge",
    operation_id = "hosted-user-email-challenge",
    tags(Hosted),
    description = "Re-sends the email verification email for the given user data."
)]
#[post("/challenge")]
async fn post(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: Json<RequestEmailVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    let (email_row, user_vault) = state
        .db_pool
        .db_query(move |conn| Email::get(conn, &request.id, &user_auth.user_vault_id()))
        .await??;
    if email_row.is_verified {
        return Err(ChallengeError::EmailAlreadyVerified.into());
    }
    let email = state
        .enclave_client
        .decrypt_bytes(
            &email_row.e_data,
            &user_vault.e_private_key,
            enclave_proxy::DataTransform::Identity,
        )
        .await?;
    let email = EmailData::from_str(email.leak())?;

    send_email_challenge(&state, email_row.id, &email.email).await?;

    Ok(Json(ApiResponseData::ok(EmptyResponse {})))
}
