use crate::{State, enclave::lib::gen_keypair};
use crate::response::success::ApiResponseData;
use crate::{auth::pk_tenant::PublicTenantAuthContext, errors::ApiError};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use db::models::{types::Status, users::NewUser};

/// Response to initialize a new user vault
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct UserInitResponse {
    /// the tenant user token
    tenant_user_id: String,
    /// the tenant auth token
    tenant_user_auth_token: String,
}

/// Initialize a user vault. Returns a token to authorize
#[api_v2_operation]
#[post("/user/init")]
async fn handler(
    pub_tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> Result<Json<ApiResponseData<UserInitResponse>>, ApiError> {
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

    Ok(Json(ApiResponseData {
        data: UserInitResponse {
            tenant_user_id: user_tenant_record.tenant_user_id,
            tenant_user_auth_token: token,
        },
    }))
}
