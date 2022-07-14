use crate::types::success::ApiResponseData;
use crate::utils::sandbox::default_is_live;
use crate::State;
use crate::{enclave::gen_keypair, errors::ApiError};
use crypto::random::gen_random_alphanumeric_code;
use db::models::ob_configurations::NewObConfiguration;
use db::models::tenant_api_keys::PartialTenantApiKey;
use newtypes::{
    DataKind, ObConfigurationId, ObConfigurationKey, ObConfigurationSettings, PiiString, TenantId,
};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use db::models::tenants::{NewTenant, Tenant};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewClientRequest {
    name: String,
    workos_org_id: String,
    /// example: onefootprint.com, gmail.com
    /// used for login gating
    email_domain: String,
    #[serde(default = "default_is_live")]
    is_live: bool,
    /// list of data kinds that this tenant requires collecting
    must_collect_data_kinds: Vec<DataKind>,
    /// list of data kinds that this tenant requires access to decrypt
    can_access_data_kinds: Vec<DataKind>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewClientResponse {
    /// unique identifier for this client
    client_id: TenantId,
    /// onboarding settings id for this client
    configuration_id: ObConfigurationId,
    /// keys for authenticating as this client
    keys: ClientKeysResponse,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct ClientKeysResponse {
    /// Public key used to identify client
    client_public_key: ObConfigurationKey,
    /// Secret key, not yet used
    client_secret_key: String,
    /// Name of this keypair, i.e. "keypair-dev" or "keypair-prod"
    key_name: String,
}

/// Create a new client (this endpoint will be private in prod TODO)
#[api_v2_operation(tags(Private))]
#[post("/client")]
async fn post(
    request: web::Json<NewClientRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<NewClientResponse>>, ApiError> {
    let (ec_pk_uncompressed, e_priv_key) = gen_keypair(&state).await?;

    let NewClientRequest {
        name,
        workos_org_id,
        email_domain,
        must_collect_data_kinds,
        can_access_data_kinds,
        is_live,
    } = request.into_inner();

    let tenant = db::tenant::init_or_get(
        &state.db_pool,
        NewTenant {
            name: name.clone(),
            e_private_key: e_priv_key,
            public_key: ec_pk_uncompressed,
            workos_id: workos_org_id,
            email_domain,
        },
    )
    .await?;

    let obc = NewObConfiguration {
        name: "Default".to_string(),
        description: None,
        tenant_id: tenant.id.clone(),
        must_collect_data_kinds,
        can_access_data_kinds,
        settings: ObConfigurationSettings::Empty,
        is_live,
    };
    let obc = obc.save(&state.db_pool).await?;

    Ok(Json(ApiResponseData {
        data: NewClientResponse {
            keys: init_api_keys(&state, &tenant, obc.key.clone(), name.to_string(), is_live).await?,
            configuration_id: obc.id,
            client_id: tenant.id,
        },
    }))
}

async fn init_api_keys(
    state: &State,
    tenant: &Tenant,
    key_id: ObConfigurationKey,
    key_name: String,
    is_live: bool,
) -> Result<ClientKeysResponse, ApiError> {
    let api_key = format!("sk_{}", gen_random_alphanumeric_code(34));

    let e_api_key = &tenant.public_key.seal_pii(&PiiString::from(api_key.as_str()))?;

    let sh_api_key = state.hmac_client.signed_hash(api_key.as_bytes()).await?;

    let tenant_keys = db::tenant::api_init(
        &state.db_pool,
        PartialTenantApiKey {
            tenant_id: tenant.id.clone(),
            key_name,
            is_live,
        },
        sh_api_key,
        e_api_key.0.clone(),
    )
    .await?;

    Ok(ClientKeysResponse {
        client_public_key: key_id,
        client_secret_key: api_key,
        key_name: tenant_keys.key_name,
    })
}
