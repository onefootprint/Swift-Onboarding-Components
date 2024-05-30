use actix_web::web;
use api_core::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use api_core::types::{
    JsonApiResponse,
    ResponseData,
};
use api_core::State;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
};

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Returns the status of Vault Disaster Recovery for the authenticated organization"
)]
#[actix::get("/org/vault_dr/status")]
pub async fn get(
    _state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<api_wire_types::VaultDrStatus> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant().clone();

    Ok(Json(ResponseData::ok(api_wire_types::VaultDrStatus {
        org_id: tenant.id,
        org_name: tenant.name,
        is_live: auth.is_live()?,
    })))
}
