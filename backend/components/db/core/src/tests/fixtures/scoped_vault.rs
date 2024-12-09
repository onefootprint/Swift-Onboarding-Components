use crate::models::data_lifetime::DataLifetime;
use crate::models::scoped_vault::NewScopedVaultArgs;
use crate::models::scoped_vault::ScopedVault;
use crate::models::user_timeline::UserTimeline;
use crate::models::vault::NewVaultArgs;
use crate::models::vault::Vault;
use crate::TxnPgConn;
use newtypes::DbActor;
use newtypes::Locked;
use newtypes::OnboardingStatus;
use newtypes::TenantId;
use newtypes::VaultCreatedInfo;
use newtypes::VaultId;

pub fn create(conn: &mut TxnPgConn, uv_id: &VaultId, tenant_id: &TenantId) -> Locked<ScopedVault> {
    let uv = Vault::lock(conn, uv_id).unwrap();
    let (sv, _) = ScopedVault::lock_or_create_for_tenant(conn, &uv, tenant_id).unwrap();
    sv
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
    let sv = ScopedVault::lock(conn, &sv.id).unwrap();

    if is_new {
        let sv_txn = DataLifetime::new_sv_txn(conn, &sv).unwrap();
        let event = VaultCreatedInfo {
            actor: DbActor::Footprint,
        };
        UserTimeline::create(conn, &sv_txn, event).unwrap();
    }

    (sv, vault)
}
