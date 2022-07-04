pub use derive_more::{Add, Display, From, Into};

use serde::{Deserialize, Serialize};

/// Symmetric key sealed bytes (for session data)
#[derive(DieselNewType, Debug, Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default)]
#[serde(transparent)]
pub struct SealedSessionBytes(pub Vec<u8>);

impl AsRef<[u8]> for SealedSessionBytes {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

/// Asymmetric (vault public key, sealed bytes)
#[derive(DieselNewType, Debug, Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default)]
#[serde(transparent)]
pub struct SealedVaultBytes(pub Vec<u8>);

impl AsRef<[u8]> for SealedVaultBytes {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}
