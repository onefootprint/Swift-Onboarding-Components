use crypto::aead::AeadSealedBytes;
use derive_more::{From, Into};

use serde::{Deserialize, Serialize};

use crate::SealedVaultDataKey;

/// Symmetric key sealed bytes (for session data)
#[derive(DieselNewType, Debug, Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default)]
#[serde(transparent)]
pub struct SealedSessionBytes(pub Vec<u8>);

impl From<AeadSealedBytes> for SealedSessionBytes {
    fn from(v: AeadSealedBytes) -> Self {
        Self(v.0)
    }
}

impl From<SealedSessionBytes> for AeadSealedBytes {
    fn from(v: SealedSessionBytes) -> Self {
        AeadSealedBytes(v.0)
    }
}

impl AsRef<[u8]> for SealedSessionBytes {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

/// Asymmetric (vault public key, sealed bytes)
#[derive(DieselNewType, Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default)]
#[serde(transparent)]
pub struct SealedVaultBytes(pub Vec<u8>);

impl std::fmt::Debug for SealedVaultBytes {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        crypto::hex::encode(&self.0).fmt(f)
    }
}

impl AsRef<[u8]> for SealedVaultBytes {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl From<SealedVaultDataKey> for SealedVaultBytes {
    fn from(key: SealedVaultDataKey) -> Self {
        Self(key.0)
    }
}
