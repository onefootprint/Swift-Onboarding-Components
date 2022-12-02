use crate::auth::user::{UserAuthContext, UserAuthScope};
use crate::errors::user::UserError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::utils::email::send_email_challenge;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;

use newtypes::email::Email as EmailData;
use newtypes::{DataAttribute, Fingerprinter};

use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct AddEmailRequest {
    email: EmailData,
    #[serde(default)]
    speculative: bool,
}

#[api_v2_operation(
    tags(Hosted),
    description = "Adds an email to the account and send a challenge."
)]
#[actix::post("/hosted/user/email")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    request: Json<AddEmailRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp])?;

    if request.speculative {
        // We've already parsed the request and done validation on the input. Return a successful
        // response before writing anything to the DB
        return Ok(Json(EmptyResponse::ok()));
    }

    let email = request.into_inner().email;
    let sh_data = state
        .compute_fingerprint(DataAttribute::Email, email.to_piistring().clean_for_fingerprint())
        .await?;
    // grab our uvw
    let email_address = email.email.clone();
    let email_id = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            // TODO For now, we only allow adding an email during onboarding since we otherwise
            // don't know which scoped user to associate the data with.
            // We might one day want to support this outside of onboarding for my1fp, but without
            // the data being portable
            let ob_info = user_auth.assert_onboarding(conn)?;
            let uvw = UserVaultWrapper::lock_for_tenant(conn, &ob_info.scoped_user.id)?;

            // Enforce that sandbox emails are used for sandbox users
            if email.is_live() != uvw.user_vault.is_live {
                return Err(UserError::SandboxMismatch.into());
            }

            let email_id = uvw.add_email(conn, email.clone(), sh_data)?;
            Ok(email_id)
        })
        .await?;

    // create the email

    send_email_challenge(&state, email_id, &email_address).await?;

    Ok(Json(ResponseData::ok(EmptyResponse {})))
}
