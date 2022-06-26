use newtypes::DataKind;

/// Vault permissions
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VaultPermission {
    Decrypt(DataKind),
    Update(DataKind),
    AddBiometrics,
    // Add(DataKind),
    // Remove(DataKind),
    //FnDecrypt(DataKind)
}

/// Determines what a principal can do on a UserVault
pub trait HasVaultPermission {
    fn has_permission(&self, permission: VaultPermission) -> bool;

    /// helper to decide for many kinds
    fn can_decrypt(&self, data_kinds: &[DataKind]) -> bool {
        data_kinds
            .iter()
            .map(|d| VaultPermission::Decrypt(*d))
            .all(|p| self.has_permission(p))
    }

    /// helper to decide for many kinds
    fn can_update(&self, data_kinds: &[DataKind]) -> bool {
        data_kinds
            .iter()
            .map(|d| VaultPermission::Update(*d))
            .all(|p| self.has_permission(p))
    }
}
