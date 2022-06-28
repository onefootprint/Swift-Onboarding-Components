pub use derive_more::{Add, Display, From, Into};

use diesel::AsExpression;
use serde::{Deserialize, Serialize};

use crate::SealedVaultBytes;

/// Bytes of a vault public key
#[derive(
    AsExpression,
    DieselNewType,
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    From,
    Into,
    Serialize,
    Deserialize,
    Default,
)]
#[serde(transparent)]
pub struct VaultPublicKey(Vec<u8>);

impl VaultPublicKey {
    pub fn from_der_bytes(bytes: &[u8]) -> Result<Self, crypto::Error> {
        let ec_pk_uncompressed = crypto::conversion::public_key_der_to_raw_uncompressed(bytes)?;
        Ok(Self(ec_pk_uncompressed))
    }
    /// unvalidated init
    pub fn unvalidated(bytes: Vec<u8>) -> Self {
        Self(bytes)
    }
}

impl AsRef<[u8]> for VaultPublicKey {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl VaultPublicKey {
    pub fn seal_data(&self, data: &str) -> Result<SealedVaultBytes, crypto::Error> {
        let result =
            crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(&self.0, data.as_bytes().to_vec())?.to_vec()?;
        Ok(SealedVaultBytes(result))
    }
}

/// Bytes of a sealed vault private key
#[derive(
    AsExpression,
    DieselNewType,
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    From,
    Into,
    Serialize,
    Deserialize,
    Default,
)]
#[serde(transparent)]
pub struct EncryptedVaultPrivateKey(pub Vec<u8>);
