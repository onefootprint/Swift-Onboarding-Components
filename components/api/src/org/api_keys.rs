use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::IsLive;
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use db::models::tenant_api_keys::NewTenantApiKey;
use newtypes::secret_api_key::SecretApiKey;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct GenerateApiKeyResponse {
    /// secret org api key
    api_key: SecretApiKey,
}

/// Generate a new tenant api key
#[api_v2_operation(tags(Org))]
#[post("/api_keys")]
async fn handler(
    state: web::Data<State>,
    auth: SessionContext<WorkOsSession>,
) -> actix_web::Result<Json<ApiResponseData<GenerateApiKeyResponse>>, ApiError> {
    let api_key = SecretApiKey::generate(auth.is_live()?);
    let tenant = auth.tenant(&state.db_pool).await?;
    let _ = NewTenantApiKey {
        sh_secret_api_key: api_key.fingerprint(&state.hmac_client).await?,
        e_secret_api_key: api_key.seal_to(&tenant.public_key)?,
        tenant_id: tenant.id,
        is_enabled: true,
        is_live: auth.is_live()?,
    }
    .create(&state.db_pool)
    .await?;

    Ok(Json(ApiResponseData {
        data: GenerateApiKeyResponse { api_key },
    }))
}
