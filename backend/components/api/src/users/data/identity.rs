//! Add data to a NON-portable user vault

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::{AuthError, HasTenant, IsLive};
use crate::types::identity_data_request::IdentityDataRequest;
use crate::types::{ApiResponseData, EmptyResponse};

use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};

use db::models::user_vault::UserVault;
use newtypes::FootprintUserId;

use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(tags(PublicApi))]
#[post("/identity")]
pub async fn post(
    state: web::Data<State>,
    path: web::Path<FootprintUserId>,
    request: Json<IdentityDataRequest>,
    tenant_auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<EmptyResponse>>, ApiError> {
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant_id();
    let is_live = tenant_auth.is_live(&state.db_pool).await?;

    let (user_vault, _scoped_user) = state
        .db_pool
        .db_query(move |conn| UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live))
        .await??;

    let request = request.into_inner();
    let fingerprints = request.fingerprints(&state).await?;
    let update = request.update;

    // TODO: add updates to security log

    let _uvw = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let mut uvw = UserVaultWrapper::lock(conn, &user_vault.id)?;
            if user_vault.is_portable {
                return Err(AuthError::CannotModifyPortableUser.into());
            }
            uvw.update_identity_data(conn, update, fingerprints)?;
            Ok(uvw)
        })
        .await?;

    Ok(Json(ApiResponseData::ok(EmptyResponse)))
}
