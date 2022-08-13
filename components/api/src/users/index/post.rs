//! Create a NON-portable user vault for a tenant

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::HasTenant;
use crate::auth::IsLive;
use crate::errors::ApiError;
use crate::types::scoped_user::ApiScopedUser;
use crate::types::ApiResponseData;
use crate::State;
use db::models::user_vaults::NewNonPortableUserVaultReq;
use paperclip::actix::{api_v2_operation, web, web::Json};

#[api_v2_operation(tags(Org, Users))]
/// creates a new user vault + scoped user that is not portable
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<ApiScopedUser>>, ApiError> {
    let (public_key, e_private_key) = crate::enclave::gen_keypair(&state).await?;

    let request = NewNonPortableUserVaultReq {
        e_private_key,
        public_key,
        is_live: auth.is_live()?,
        tenant_id: auth.tenant_id(),
    };

    let scoped = db::user_vault::create_non_portable(&state.db_pool, request).await?;

    Ok(Json(ApiResponseData::ok(ApiScopedUser::from(
        vec![],
        &vec![],
        scoped,
        false,
    ))))
}
