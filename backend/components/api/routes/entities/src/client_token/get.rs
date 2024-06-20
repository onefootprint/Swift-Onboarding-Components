use api_core::auth::tenant::ClientTenantAuthContext;
use api_core::auth::tenant::ClientTenantScope;
use api_core::auth::Any;
use api_core::types::ModernApiResult;
use api_wire_types::GetClientTokenResponse;
use api_wire_types::GetClientTokenResponseTenant;
use paperclip::actix::api_v2_operation;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Client, Private),
    description = "Returns information about the provided client auth token."
)]
#[actix::get("/entities/client_token")]
pub fn get(auth: ClientTenantAuthContext) -> ModernApiResult<GetClientTokenResponse> {
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

    let tenant = GetClientTokenResponseTenant {
        name: auth.data.tenant.name,
    };

    Ok(GetClientTokenResponse {
        expires_at,
        vault_fields,
        tenant,
    })
}
