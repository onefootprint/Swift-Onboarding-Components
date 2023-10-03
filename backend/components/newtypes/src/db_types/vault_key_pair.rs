use crypto::seal::EciesP256Sha256AesGcmSealed;
use derive_more::{From, Into};
use serde::{Deserialize, Serialize};

use crate::{PiiString, SealedVaultBytes};

/// Bytes of a vault public key
#[derive(DieselNewType, Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default)]
#[serde(transparent)]
pub struct VaultPublicKey(Vec<u8>);

impl std::fmt::Debug for VaultPublicKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        crypto::hex::encode(&self.0).fmt(f)
    }
}
impl VaultPublicKey {
    pub fn from_der_bytes(bytes: &[u8]) -> Result<Self, crypto::Error> {
        let ec_pk_uncompressed = crypto::conversion::public_key_der_to_raw_uncompressed(bytes)?;
        Ok(Self(ec_pk_uncompressed))
    }

    pub fn from_raw_uncompressed(bytes: &[u8]) -> Result<Self, crypto::Error> {
        let ec_pk_uncompressed = crypto::conversion::public_key_raw_uncompressed_validated(bytes)?;
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
    pub fn seal_pii(&self, pii: &PiiString) -> Result<SealedVaultBytes, crypto::Error> {
        self.seal_data(pii.leak())
    }

    pub(crate) fn seal_data(&self, data: &str) -> Result<SealedVaultBytes, crypto::Error> {
        let result = self.seal_bytes(data.as_bytes())?;
        Ok(result)
    }

    pub fn seal_bytes(&self, bytes: &[u8]) -> Result<SealedVaultBytes, crypto::Error> {
        let result = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(&self.0, bytes.to_vec())?.to_vec()?;
        Ok(SealedVaultBytes(result))
    }
}

/// Bytes of a sealed vault private key
#[derive(DieselNewType, Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default)]
#[serde(transparent)]
pub struct EncryptedVaultPrivateKey(pub Vec<u8>);

impl std::fmt::Debug for EncryptedVaultPrivateKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        crypto::hex::encode(&self.0).fmt(f)
    }
}

/// Bytes of a sealed vault private key
#[derive(DieselNewType, Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default)]
#[serde(transparent)]
pub struct SealedVaultDataKey(pub Vec<u8>);

impl std::fmt::Debug for SealedVaultDataKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        crypto::hex::encode(&self.0).fmt(f)
    }
}

impl TryFrom<EciesP256Sha256AesGcmSealed> for SealedVaultDataKey {
    type Error = crypto::Error;

    fn try_from(value: EciesP256Sha256AesGcmSealed) -> Result<Self, Self::Error> {
        Ok(Self(value.to_vec()?))
    }
}
