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
}
