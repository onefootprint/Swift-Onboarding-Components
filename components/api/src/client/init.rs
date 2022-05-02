use crate::response::success::ApiResponseData;
use crate::State;
use crate::{enclave::lib::gen_keypair, errors::ApiError};

use crypto::random::gen_random_alphanumeric_code;
use db::models::tenant_api_keys::PartialTenantApiKey;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use db::models::tenants::{NewTenant, Tenant};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewClientRequest {
    name: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewClientResponse {
    /// unique identifier for this client
    client_id: String,
    /// keys for authenticating as this client
    keys: ClientKeysResponse,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct ClientKeysResponse {
    /// Public key used to identify client
    client_public_key: String,
    /// Secret key, not yet used
    client_secret_key: String,
    /// Name of this keypair, i.e. "keypair-dev" or "keypair-prod"
    key_name: String,
}

/// Create a new client (this endpoint will be private in prod TODO)
#[api_v2_operation]
#[post("/client/init")]
async fn handler(
    request: web::Json<NewClientRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<NewClientResponse>>, ApiError> {
    let (ec_pk_uncompressed, e_priv_key) = gen_keypair(&state).await?;

    let tenant = db::tenant::init(
        &state.db_pool,
        NewTenant {
            name: request.into_inner().name,
            e_private_key: e_priv_key,
            public_key: ec_pk_uncompressed,
        },
    )
    .await?;

    Ok(Json(ApiResponseData {
        data: NewClientResponse {
            keys: init_api_keys(&state, &tenant).await?,
            client_id: tenant.id,
        },
    }))
}

async fn init_api_keys(state: &State, tenant: &Tenant) -> Result<ClientKeysResponse, ApiError> {
    let api_key = format!("sk_{}", gen_random_alphanumeric_code(34));

    let e_api_key = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
        &tenant.public_key,
        api_key.clone().into_bytes(),
    )?;

    let tenant_keys = db::tenant::api_init(
        &state.db_pool,
        PartialTenantApiKey {
            tenant_id: tenant.id.clone(),
            key_name: "default".to_string(),
        },
        api_key.clone(),
        e_api_key.to_vec()?,
    )
    .await?;

    Ok(ClientKeysResponse {
        client_public_key: tenant_keys.tenant_public_key,
        client_secret_key: api_key,
        key_name: tenant_keys.key_name,
    })
}
