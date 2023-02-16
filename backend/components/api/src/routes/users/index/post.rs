//! Create a NON-portable user vault for a tenant

use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantAuth;
use crate::errors::ApiError;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::user_vault::NewNonPortablePersonUserVaultReq;
use db::models::user_vault::UserVault;
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

    let request = NewNonPortablePersonUserVaultReq {
        e_private_key,
        public_key,
        is_live: auth.is_live()?,
        tenant_id: auth.tenant().id.clone(),
    };

    let scoped_user = state
        .db_pool
        .db_transaction(|conn| UserVault::create_non_portable_person_vault(conn, request))
        .await?;

    let su = scoped_user.clone();
    if su.is_live && crate::decision::utils::should_bill(&state.feature_flag_client, &su.tenant_id) {
        billing::update_pii_charge(state.stripe_client.clone(), state.db_pool.clone(), su.tenant_id);
    }

    Ok(Json(ResponseData::ok(api_wire_types::User::from_db(scoped_user))))
}
