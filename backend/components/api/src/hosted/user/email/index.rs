use crate::auth::UserAuth;
use crate::auth::{session_data::user::UserAuthScope, VerifiedUserAuth};

use crate::errors::user::UserError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::utils::email::send_email_challenge;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;

use newtypes::email::Email as EmailData;
use newtypes::{DataAttribute, Fingerprinter};

use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct AddEmailRequest {
    email: EmailData,
    #[serde(default)]
    speculative: bool,
}

#[api_v2_operation(
    summary = "/hosted/user/email",
    operation_id = "hosted-user-email",
    tags(Hosted),
    description = "Adds an email to the account and send a challenge."
)]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: Json<AddEmailRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp])?;

    if request.speculative {
        // We've already parsed the request and done validation on the input. Return a successful
        // response before writing anything to the DB
        return Ok(Json(EmptyResponse::ok()));
    }

    let user_vault = user_auth.user_vault(&state.db_pool).await?;

    let email = request.into_inner().email;
    // Enforce that sandbox emails are used for sandbox users
    if email.is_live() != user_vault.is_live {
        return Err(UserError::SandboxMismatch.into());
    }

    let sh_data = state
        .compute_fingerprint(DataAttribute::Email, email.to_piistring().clean_for_fingerprint())
        .await?;
    // grab our uvw
    let email_address = email.email.clone();
    let email_id = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let mut uvw = UserVaultWrapper::lock(conn, &user_vault.id)?;
            let email_id = uvw.add_email(conn, email.clone(), sh_data)?;
            Ok(email_id)
        })
        .await?;

    // create the email

    send_email_challenge(&state, email_id, &email_address).await?;

    Ok(Json(ResponseData::ok(EmptyResponse {})))
}
