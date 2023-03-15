use std::str::FromStr;

use crate::auth::user::{UserAuthContext, UserAuthScope};
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::email::send_email_challenge;
use crate::utils::fingerprint::build_fingerprints;
use crate::utils::vault_wrapper::checks::pre_add_data_checks;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use newtypes::email::Email;
use newtypes::put_data_request::PutDataRequest;
use newtypes::IdentityDataKind;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the vault",
    tags(Vault, Users)
)]
#[actix::post("/hosted/user/vault/validate")]
pub async fn post_validate(
    request: Json<PutDataRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    user_auth.check_permissions(vec![UserAuthScope::SignUp])?;
    let request = request.into_inner().decompose(true)?;
    request.assert_no_business_data()?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Updates data in a user vault. Can be used to update `id.` data or `custom.` data.",
    tags(Vault, Users)
)]
#[actix::put("/hosted/user/vault")]
pub async fn put(
    state: web::Data<State>,
    request: Json<PutDataRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp])?;
    let request = request.into_inner().decompose(true)?;
    let fingerprints = build_fingerprints(&state, request.id_update.clone()).await?;
    let email = request
        .id_update
        .get(&IdentityDataKind::Email)
        .map(|p| Email::from_str(p.leak()))
        .transpose()?;
    let email_is_live = email.as_ref().map(|e| e.is_live());

    let email_id = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user_id = pre_add_data_checks(&user_auth, conn)?;
            let uvw = VaultWrapper::lock_for_onboarding(conn, &scoped_user_id)?;
            // Enforce that sandbox emails/phones are used for sandbox users
            if let Some(is_live) = email_is_live {
                if is_live != uvw.vault().is_live {
                    return Err(UserError::SandboxMismatch.into());
                }
            }

            // Even though this accepts id.phone_number, it will always error at runtime since we
            // only allow a vault to have one phone number
            let email_id = uvw.put_person_data(conn, request, fingerprints, true)?;
            Ok(email_id)
        })
        .await?;

    // If we just added a new email address to the vault, send a verification email
    if let Some((email, id)) = email.and_then(|e| email_id.map(|id| (e, id))) {
        send_email_challenge(&state, id, &email.email).await?;
    }

    EmptyResponse::ok().json()
}
