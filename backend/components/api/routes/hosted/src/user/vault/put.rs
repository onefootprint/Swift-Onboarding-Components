use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::email::send_email_challenge;
use crate::utils::headers::AllowExtraFieldsHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::user::{UserAuthGuard, UserObAuthContext};
use api_core::utils::vault_wrapper::checks::pre_add_data_checks;
use api_core::utils::vault_wrapper::{Any, TenantUvw};
use newtypes::email::Email;
use newtypes::put_data_request::RawDataRequest;
use newtypes::{DataIdentifier, IdentityDataKind as IDK, ParseOptions};
use paperclip::actix::{self, api_v2_operation, web, web::Json};
use std::str::FromStr;

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the vault",
    tags(Hosted, Vault, Users)
)]
#[actix::post("/hosted/user/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserObAuthContext,
    allow_extra_fields: AllowExtraFieldsHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    pre_add_data_checks(&user_auth)?;
    let opts = ParseOptions {
        for_bifrost: true,
        allow_dangling_keys: *allow_extra_fields,
    };
    let request = request.into_inner().clean_and_validate(opts)?;
    let request = request.no_fingerprints(); // No fingerprints to check speculatively
    let su_id = user_auth.data.scoped_user.id;
    let uvw: TenantUvw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &su_id))
        .await??;
    request.assert_allowable_identifiers(uvw.vault.kind)?;
    uvw.validate_request(request)?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(description = "Updates data in a user vault", tags(Hosted, Vault, Users))]
#[actix::put("/hosted/user/vault")]
pub async fn put(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserObAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    pre_add_data_checks(&user_auth)?;
    let su_id = user_auth.data.scoped_user.id;
    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_bifrost())?;
    let email = request
        .get(&IDK::Email.into())
        .map(|p| Email::from_str(p.leak()))
        .transpose()?;
    let email_is_live = email.as_ref().map(|e| e.is_live());

    let request = request.build_global_fingerprints(state.as_ref()).await?;

    let new_ci = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su_id)?;
            // Enforce that sandbox emails/phones are used for sandbox users
            if let Some(is_live) = email_is_live {
                if is_live != uvw.vault().is_live {
                    return Err(UserError::SandboxMismatch.into());
                }
            }

            // Even though this accepts id.phone_number, it will always error at runtime since we
            // only allow a vault to have one phone number
            let (new_contact_info, _) = uvw.patch_data(conn, request)?;
            Ok(new_contact_info)
        })
        .await?;

    // If we just added a new email address to the vault, send a verification email
    if let Some(email) = email {
        if let Some((_, ci)) = new_ci
            .into_iter()
            .find(|(di, _)| di == &DataIdentifier::from(IDK::Email))
        {
            send_email_challenge(&state, ci.id, &email.email).await?;
        }
    }

    EmptyResponse::ok().json()
}
