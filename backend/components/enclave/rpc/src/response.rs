use std::fmt::Debug;

use crypto::seal::{SealedChaCha20Poly1305DataKey, SealedEciesP256KeyPair};
use serde::{Deserialize, Serialize};

use uuid::Uuid;

use crate::DataTransform;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnclaveResponse {
    pub request_id: Uuid,
    pub payload: EnclavePayload,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EnclavePayload {
    Pong(String),
    GenerateDataKeyPair(GeneratedDataKeyPair),
    GenerateSymmetricDataKey(GeneratedSealedDataKeyWithPlaintext),
    FnDecryption(FnDecryption),
    HmacSignature(HmacSignature),
    Ok,
    Error(String),
}

impl EnclavePayload {
    /// check if we're an 'Ok' response
    pub fn is_ok(&self) -> bool {
        matches!(self, Self::Ok)
    }
}

impl TryFrom<EnclavePayload> for FnDecryption {
    type Error = crate::Error;

    fn try_from(value: EnclavePayload) -> Result<Self, Self::Error> {
        if let EnclavePayload::FnDecryption(r) = value {
            Ok(r)
        } else if let EnclavePayload::Error(error) = value {
            Err(crate::Error::EnclaveError(error))
        } else {
            Err(crate::Error::UnexpectedResponse)
        }
    }
}

impl TryFrom<EnclavePayload> for HmacSignature {
    type Error = crate::Error;

    fn try_from(value: EnclavePayload) -> Result<Self, Self::Error> {
        if let EnclavePayload::HmacSignature(r) = value {
            Ok(r)
        } else if let EnclavePayload::Error(error) = value {
            Err(crate::Error::EnclaveError(error))
        } else {
            Err(crate::Error::UnexpectedResponse)
        }
    }
}

impl TryFrom<EnclavePayload> for GeneratedDataKeyPair {
    type Error = crate::Error;

    fn try_from(value: EnclavePayload) -> Result<Self, Self::Error> {
        if let EnclavePayload::GenerateDataKeyPair(r) = value {
            Ok(r)
        } else if let EnclavePayload::Error(error) = value {
            Err(crate::Error::EnclaveError(error))
        } else {
            Err(crate::Error::UnexpectedResponse)
        }
    }
}

impl TryFrom<EnclavePayload> for GeneratedSealedDataKeyWithPlaintext {
    type Error = crate::Error;

    fn try_from(value: EnclavePayload) -> Result<Self, Self::Error> {
        if let EnclavePayload::GenerateSymmetricDataKey(r) = value {
            Ok(r)
        } else if let EnclavePayload::Error(error) = value {
            Err(crate::Error::EnclaveError(error))
        } else {
            Err(crate::Error::UnexpectedResponse)
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct GeneratedDataKeyPair {
    pub sealed_key_pair: SealedEciesP256KeyPair,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct FnDecryption {
    pub results: Vec<FnDecryptionSingle>,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct FnDecryptionSingle {
    pub transform: DataTransform,
    pub data: Vec<u8>,
}
impl Debug for FnDecryptionSingle {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("FnDecryptionSingle")
            .field("transform", &self.transform)
            .field("data", &"<omitted>")
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct HmacSignature {
    pub signature: Vec<u8>,
}
impl Debug for HmacSignature {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("HmacSignature")
            .field("signature", &"<omitted>")
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct GeneratedSealedDataKeyWithPlaintext {
    pub sealed_key_with_plaintext: SealedChaCha20Poly1305DataKey,
}

impl Debug for GeneratedSealedDataKeyWithPlaintext {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("GeneratedSealedDataKeyWithPlaintext { omitted }")
    }
}
