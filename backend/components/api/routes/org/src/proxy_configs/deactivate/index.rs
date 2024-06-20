use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ModernApiResult;
use api_core::State;
use db::models::proxy_config::ProxyConfig;
use db::DbError;
use newtypes::ProxyConfigId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Delete organization's proxy configurations",
    tags(ProxyConfigs, Organization, Private)
)]
#[actix::post("/org/proxy_configs/{proxy_config_id}/deactivate")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    proxy_config_id: web::Path<ProxyConfigId>,
) -> ModernApiResult<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::ManageVaultProxy)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let is_live = auth.is_live()?;
    let proxy_config_id = proxy_config_id.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            ProxyConfig::deactivate(conn, proxy_config_id, tenant_id, is_live)
        })
        .await?;

    Ok(api_wire_types::Empty)
}
