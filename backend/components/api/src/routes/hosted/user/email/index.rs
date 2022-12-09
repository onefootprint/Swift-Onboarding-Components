use crate::auth::tenant::{ParsedOnboardingSession, PublicOnboardingContext};
use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::auth::{Either, SessionContext};
use crate::errors::user::UserError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::utils::email::send_email_challenge;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;

use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use newtypes::email::Email as EmailData;
use newtypes::{DataLifetimeKind, Fingerprinter};

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
    onboarding_context: Option<Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>>,
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
        .compute_fingerprint(
            DataLifetimeKind::Email,
            email.to_piistring().clean_for_fingerprint(),
        )
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
            UserVault::lock(conn, &user_auth.user_vault_id())?; // Lock since we might create scoped user
            let scoped_user_id = if let Some(ob_info) = user_auth.onboarding(conn)? {
                // We have an auth token from after calling POST /hosted/onboarding - the scoped
                // user has already been created
                ob_info.scoped_user.id
            } else if let Some(ob_context) = onboarding_context {
                // Or, an ob config public key was provided. get or create the scoped user
                // NOTE: This is only a short-term action to allow rolling out data model v4.
                // We need to find a better way of associating data with a tenant
                // https://linear.app/footprint/issue/FP-2139/handle-email-update-when-an-email-already-exists
                let scoped_user = ScopedUser::get_or_create(
                    conn,
                    user_auth.user_vault_id(),
                    ob_context.tenant().id.clone(),
                    ob_context.ob_config().is_live,
                )?;
                scoped_user.id
            } else {
                return Err(UserError::NotAllowedOutsideOnboarding.into());
            };
            let uvw = UserVaultWrapper::lock_for_tenant(conn, &scoped_user_id)?;

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
