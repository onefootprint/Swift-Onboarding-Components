//! Create a NON-portable user vault for a tenant

use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantAuth;
use crate::errors::ApiError;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::NewNonPortableUserVaultReq;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    description = "Creates a new user vault + scoped user that is not portable.",
    tags(Users, PublicApi)
)]
#[post("/users")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ResponseData<api_wire_types::User>>, ApiError> {
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;

    let request = NewNonPortableUserVaultReq {
        e_private_key,
        public_key,
        is_live: auth.is_live()?,
        tenant_id: auth.tenant().id.clone(),
    };

    let scoped = db::user_vault::create_non_portable(&state.db_pool, request).await?;

    Ok(Json(ResponseData::ok(api_wire_types::User::from_db(scoped))))
}

impl DbToApi<ScopedUser> for api_wire_types::User {
    fn from_db(target: ScopedUser) -> Self {
        let ScopedUser {
            id: _,
            fp_user_id,
            user_vault_id: _,
            tenant_id: _,
            _created_at,
            _updated_at,
            ordering_id,
            start_timestamp,
            is_live: _,
        } = target;

        Self {
            id: fp_user_id,
            is_portable: false,
            identity_data_attributes: vec![],
            start_timestamp,
            onboardings: vec![],
            ordering_id,
        }
    }
}
