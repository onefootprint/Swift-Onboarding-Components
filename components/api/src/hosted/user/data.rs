use crate::auth::session_data::user::UserAuthScope;
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::errors::user::UserError;
use crate::types::response::ApiResponseData;
use crate::types::user_patch_request::UserPatchRequest;
use crate::types::EmptyResponse;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, utils::email::send_email_challenge, State};
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(tags(User))]
#[post("/data")]
/// Operates as a PATCH request to update data in the user vault
async fn handler(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: web::Json<UserPatchRequest>,
) -> actix_web::Result<Json<ApiResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp])?;
    if request.speculative {
        // We've already parsed the request and done validation on the input. Return a successful
        // response before writing anything to the DB
        return Ok(Json(ApiResponseData::ok(EmptyResponse)));
    }

    let user_vault = user_auth.user_vault(&state.db_pool).await?;
    let request = request.into_inner();

    // Enforce that sandbox emails are used for sandbox users
    let email_update = request.email.clone();
    if let Some(email) = &email_update {
        if email.is_live() != user_vault.is_live {
            return Err(UserError::SandboxMismatch.into());
        }
    }

    let new_data = request.decompose_and_seal(&state, &user_vault).await?;
    let uvw = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let mut uvw = UserVaultWrapper::from_conn(conn, user_vault)?;
            uvw.process_updates(conn, new_data)?;
            Ok(uvw)
        })
        .await?;

    // If we updated the email address, send an async challenge to the new email address
    if let Some(email) = &email_update {
        // We only support one email per request, so there will be a UserData row
        // TODO support multiple emails per user vault
        let email_row = uvw.emails.first().ok_or(ApiError::NotImplemented)?;
        send_email_challenge(&state, email_row.id.clone(), &email.email).await?;
    }
    Ok(Json(ApiResponseData::ok(EmptyResponse)))
}
