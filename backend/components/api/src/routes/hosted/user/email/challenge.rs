use std::str::FromStr;

use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::errors::challenge::ChallengeError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::utils::email::send_email_challenge;
use crate::State;
use db::models::email::Email;
use newtypes::email::Email as EmailData;
use newtypes::EmailId;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct RequestEmailVerifyRequest {
    id: EmailId,
}

#[api_v2_operation(
    tags(Hosted),
    description = "Re-sends the email verification email for the given user data."
)]
#[actix::post("/hosted/user/email/challenge")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    request: Json<RequestEmailVerifyRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    let (email_row, user_vault) = state
        .db_pool
        .db_query(move |conn| Email::get(conn, &request.id, user_auth.user_vault_id()))
        .await??;
    if email_row.is_verified {
        return Err(ChallengeError::EmailAlreadyVerified.into());
    }
    let email = state
        .enclave_client
        .decrypt_to_piistring(
            &email_row.e_data,
            &user_vault.e_private_key,
            enclave_proxy::DataTransform::Identity,
        )
        .await?;
    let email = EmailData::from_str(email.leak())?;

    send_email_challenge(&state, email_row.id, &email.email).await?;

    Ok(Json(ResponseData::ok(EmptyResponse {})))
}
