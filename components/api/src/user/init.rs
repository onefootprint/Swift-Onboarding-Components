use crate::{State, enclave::lib::gen_keypair};
use crate::{auth::pk_tenant::PublicTenantAuthContext, errors::ApiError};
use crate::response::success::ApiResponseData;
use actix_web::{post, web};

use db::models::{types::Status, users::NewUser};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct UserInitResponse {
    tenant_user_id: String,
    tenant_user_auth_token: String,
}

#[post("/user/init")]
async fn handler(
    pub_tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<ApiResponseData<UserInitResponse>, ApiError> {
    // TODO, add email & phone number to request & check against existing entries
    let (ec_pk_uncompressed, e_priv_key) = gen_keypair(&state).await?;

    let user = NewUser {
        e_private_key: e_priv_key.clone(),
        public_key: ec_pk_uncompressed.clone(),
        id_verified: Status::Incomplete,
        is_phone_number_verified: false,
        is_email_verified: false,
    };

    let (user_tenant_record, token) =
        db::user::init(&state.db_pool, user, pub_tenant_auth.tenant().id.clone()).await?;

    Ok(ApiResponseData{
        data: UserInitResponse {
            tenant_user_id: user_tenant_record.tenant_user_id,
            tenant_user_auth_token: token,
        }
    })
}
