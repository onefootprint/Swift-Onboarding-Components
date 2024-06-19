use actix_web::web;
use api_core::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use api_core::types::ModernApiResult;
use api_core::State;
use db::models::vault_dr::VaultDrConfig;
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
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> ModernApiResult<api_wire_types::VaultDrStatus> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let is_live = auth.is_live()?;

    let config = state
        .db_pool
        .db_query(move |conn| VaultDrConfig::get(conn, &tenant_id, is_live))
        .await?;

    let enrolled_status = config.map(|c| api_wire_types::VaultDrEnrolledStatus {
        enrolled_at: c.created_at,
        aws_account_id: c.aws_account_id,
        aws_role_name: c.aws_role_name,
        s3_bucket_name: c.s3_bucket_name,
        org_public_key: c.org_public_key,
    });

    Ok(api_wire_types::VaultDrStatus {
        org_id: tenant.id.clone(),
        org_name: tenant.name.clone(),
        is_live: auth.is_live()?,
        enrolled_status,
    })
}
