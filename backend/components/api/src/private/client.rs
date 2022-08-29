use crate::auth::key_context::custodian::CustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::types::secret_api_key::TenantApiKeyResponse;
use crate::State;
use db::models::tenant_api_key::TenantApiKey;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::TenantId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use db::models::tenant::NewTenant;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewClientRequest {
    name: String,
    /// the org to attach this client to
    workos_org_id: Option<String>,
    /// determines if a live api key is created or not
    is_live: bool,
    /// logo url
    logo_url: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
struct NewClientResponse {
    /// unique identifier for this client
    org_id: TenantId,
    /// api key for org-level api access
    key: TenantApiKeyResponse,
}

/// Create a new client (this endpoint will be private in prod TODO)
#[api_v2_operation(tags(Private))]
#[post("/client")]
async fn post(
    request: web::Json<NewClientRequest>,
    _custodian: CustodianAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<NewClientResponse>>, ApiError> {
    let (ec_pk_uncompressed, e_priv_key) = state.enclave_client.generate_sealed_keypair().await?;

    let NewClientRequest {
        name,
        workos_org_id,
        is_live,
        logo_url,
    } = request.into_inner();

    let tenant = NewTenant {
        name: name.clone(),
        e_private_key: e_priv_key,
        public_key: ec_pk_uncompressed,
        workos_id: workos_org_id,
        workos_admin_profile_id: None,
        logo_url,
        sandbox_restricted: false, // this is needed for our integration tests
    }
    .create(&state.db_pool)
    .await?;

    let secret_api_key = SecretApiKey::generate(is_live);
    let new_key = TenantApiKey::create(
        &state.db_pool,
        "Secret key".to_owned(), // TODO
        secret_api_key.fingerprint(&state.hmac_client).await?,
        secret_api_key.seal_to(&tenant.public_key)?,
        tenant.id.clone(),
        is_live,
    )
    .await?;

    Ok(Json(ApiResponseData {
        data: NewClientResponse {
            org_id: tenant.id,
            key: TenantApiKeyResponse::from((new_key, Some(secret_api_key))),
        },
    }))
}
