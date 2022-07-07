use crate::auth::either::EitherSession;
use crate::auth::session_context::HasUserVaultId;
use crate::auth::session_data::user::my_fp::My1fpBasicSession;
use crate::auth::session_data::user::onboarding::OnboardingSession;
use crate::auth::uv_permission::HasVaultPermission;
use crate::auth::AuthError;
use crate::types::success::ApiResponseData;
use crate::{
    errors::ApiError,
    utils::{email::send_email_challenge, user_vault_wrapper::UserVaultWrapper},
    State,
};
use db::models::user_vaults::UserVault;

use newtypes::{DataKind, PiiString, UserPatchRequest};
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(tags(User))]
#[post("/data")]
/// Operates as a PATCH request to update data in the user vault. Requires user authentication
/// sent in the cookie after a successful /identify/verify call.
async fn handler(
    state: web::Data<State>,
    user_auth: EitherSession<OnboardingSession, My1fpBasicSession>,
    request: web::Json<UserPatchRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    let user_vault = user_auth.user_vault(&state.db_pool).await?;
    let request = request.into_inner();
    update(&user_auth, &state, &request, &user_vault).await?;

    // If we updated the email address, send an async challenge to the new email address
    if let Some(email) = request.email.map(PiiString::from).clone() {
        send_email_challenge(&state, user_vault.id.clone(), &email).await?;
    }
    Ok(Json(ApiResponseData {
        data: "Successful update".to_string(),
    }))
}

pub async fn update<C: HasVaultPermission>(
    context: &C,
    state: &web::Data<State>,
    request: &UserPatchRequest,
    user_vault: &UserVault,
) -> Result<(), ApiError> {
    let update_requests = request.decompose();

    let data_kinds: Vec<DataKind> = update_requests
        .clone()
        .into_iter()
        .flat_map(|update| -> Vec<DataKind> { update.data.into_iter().map(|(kind, _)| kind).collect() })
        .collect();

    if !context.can_update(&data_kinds) {
        return Err(AuthError::SessionTypeError.into());
    }

    // Lock the user vault to prevent someone else from editing the data while we're editing it
    let uvw = UserVaultWrapper::from(&state.db_pool, user_vault.to_owned()).await?;
    uvw.bulk_update(state, user_vault.id.clone(), &update_requests)
        .await?;

    Ok(())
}
