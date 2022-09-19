//! Create a NON-portable user vault for a tenant

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::TenantAuth;
use crate::errors::ApiError;
use crate::types::scoped_user::FpScopedUser;
use crate::types::ResponseData;
use crate::State;
use db::models::user_vault::NewNonPortableUserVaultReq;
use paperclip::actix::{api_v2_operation, web, web::Json};

#[api_v2_operation(
    summary = "/users",
    operation_id = "users-post",
    description = "Creates a new user vault + scoped user that is not portable.",
    tags(PublicApi)
)]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ResponseData<FpScopedUser>>, ApiError> {
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;

    let request = NewNonPortableUserVaultReq {
        e_private_key,
        public_key,
        is_live: auth.is_live()?,
        tenant_id: auth.tenant().id.clone(),
    };

    let scoped = db::user_vault::create_non_portable(&state.db_pool, request).await?;

    Ok(Json(ResponseData::ok(FpScopedUser::from(
        vec![],
        &[],
        scoped,
        false,
    ))))
}
