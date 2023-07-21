use crate::types::response::ResponseData;
use api_core::auth::tenant::{ClientTenantAuthContext, ClientTenantScope};
use api_core::auth::Any;
use api_core::types::JsonApiResponse;
use chrono::{DateTime, Utc};
use newtypes::DataIdentifier;
use paperclip::actix::{self, api_v2_operation, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ClientTokenResponse {
    /// The list of fields that are allowed to be vaulted by this token
    pub vault_fields: Vec<DataIdentifier>,
    /// The time at which this token will expire.
    pub expires_at: DateTime<Utc>,
}

#[api_v2_operation(
    tags(Private),
    description = "Returns information about the provided client auth token."
)]
#[actix::get("/entities/client_token")]
pub async fn get(auth: ClientTenantAuthContext) -> JsonApiResponse<ClientTokenResponse> {
    let auth = auth.check_guard(Any)?;

    let expires_at = auth.expires_at();
    let vault_fields = auth
        .data
        .scopes
        .into_iter()
        .flat_map(|s| match s {
            ClientTenantScope::Vault(s) => s,
            _ => vec![],
        })
        .collect();

    Ok(Json(ResponseData::ok(ClientTokenResponse {
        expires_at,
        vault_fields,
    })))
}
