use db::helpers::vault_dr::VdrBlobKey;
use newtypes::DataIdentifier;
use newtypes::ScopedVaultVersionNumber;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize)]
pub struct Manifest {
    pub version: ScopedVaultVersionNumber,
    /// Maps DI names present in the vault at this version to the base name of key where the
    /// encrypted value is stored.
    pub fields: HashMap<DataIdentifier, BlobBaseName>,
}

#[derive(Debug, Clone, Serialize)]
pub struct BlobBaseName(String);

impl BlobBaseName {
    pub fn new_from_key(key: VdrBlobKey) -> Self {
        let key: String = key.into();
        let basename = key.rsplit('/').next().unwrap_or(&key).to_owned();
        Self(basename)
    }
}
