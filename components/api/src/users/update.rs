//! Add data to a NON-portable user vault

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::{AuthError, HasTenant, IsLive};
use crate::types::user_patch_request::UserPatchRequest;
use crate::types::{ApiResponseData, EmptyResponse};
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};

use db::models::scoped_users::ScopedUser;
use db::models::user_vaults::UserVault;
use newtypes::FootprintUserId;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(tags(Org, Users))]
#[post("/{footprint_user_id}/data")]
pub async fn post(
    state: web::Data<State>,
    path: web::Path<FootprintUserId>,
    request: Json<UserPatchRequest>,
    tenant_auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<EmptyResponse>>, ApiError> {
    let footprint_user_id = path.into_inner();

    let (user_vault, scoped_user) = UserVault::get_non_portable_for_tenant(
        &state.db_pool,
        tenant_auth.tenant_id(),
        footprint_user_id,
        tenant_auth.is_live()?,
    )
    .await?
    .ok_or(AuthError::InvalidTenantKeyOrUserId)?;

    perform_update(state, request.into_inner(), user_vault, scoped_user).await?;

    Ok(Json(ApiResponseData::ok(EmptyResponse)))
}

async fn perform_update(
    state: web::Data<State>,
    request: UserPatchRequest,
    user_vault: UserVault,
    _scoped_user: ScopedUser,
) -> actix_web::Result<Json<ApiResponseData<EmptyResponse>>, ApiError> {
    let new_data = request.decompose_and_seal(&state, &user_vault).await?;
    let _uvw = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            
            let mut uvw = UserVaultWrapper::from_conn(conn, user_vault)?;
            uvw.process_updates(conn, new_data)?;
            Ok(uvw)
        })
        .await?;

    Ok(Json(ApiResponseData::ok(EmptyResponse)))
}
