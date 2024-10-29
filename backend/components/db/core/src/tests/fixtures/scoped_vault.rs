use crate::models::scoped_vault::NewScopedVaultArgs;
use crate::models::scoped_vault::ScopedVault;
use crate::models::user_timeline::UserTimeline;
use crate::models::vault::NewVaultArgs;
use crate::models::vault::Vault;
use crate::TxnPgConn;
use newtypes::DbActor;
use newtypes::Locked;
use newtypes::ObConfigurationId;
use newtypes::OnboardingStatus;
use newtypes::TenantId;
use newtypes::VaultCreatedInfo;
use newtypes::VaultId;

pub fn create(
    conn: &mut TxnPgConn,
    uv_id: &VaultId,
    ob_config_id: &ObConfigurationId,
) -> Locked<ScopedVault> {
    let uv = Vault::lock(conn, uv_id).unwrap();
    let sv = ScopedVault::get_or_create_for_tenant(conn, &uv, ob_config_id)
        .unwrap()
        .0;

    ScopedVault::lock(conn, &sv.id).unwrap()
}

pub fn create_non_portable(
    conn: &mut TxnPgConn,
    args: NewVaultArgs,
    tenant_id: &TenantId,
) -> (Locked<ScopedVault>, Vault) {
    let sv_args = NewScopedVaultArgs {
        is_active: true,
        status: OnboardingStatus::None,
        tenant_id,
        external_id: None,
    };
    let (sv, vault, is_new) = ScopedVault::get_or_create_by_external_id(conn, args, sv_args, None).unwrap();
    if is_new {
        let event = VaultCreatedInfo {
            actor: DbActor::Footprint,
        };
        UserTimeline::create(conn, event, vault.id.clone(), sv.id.clone()).unwrap();
    }

    let sv = ScopedVault::lock(conn, &sv.id).unwrap();

    (sv, vault)
}
