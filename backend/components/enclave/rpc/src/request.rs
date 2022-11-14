use std::fmt::Debug;

use crypto::{aead::AeadSealedBytes, hex::ToHex, seal::EciesP256Sha256AesGcmSealed, sha256};
use serde::{Deserialize, Serialize};

use uuid::Uuid;

use crate::{types::KmsCredentials, DataTransform};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcRequest {
    pub id: Uuid,
    pub payload: RpcPayload,
}

impl RpcRequest {
    pub fn new(payload: RpcPayload) -> Self {
        Self {
            id: Uuid::new_v4(),
            payload,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RpcPayload {
    Ping(String),
    GenerateDataKeypair(GenerateDataKeypairRequest),
    GenerateSymmetricDataKey(GenerateSymmetricDataKeyRequest),
    FnDecrypt(EnvelopeDecryptRequest),
    HmacSign(EnvelopeHmacSignRequest),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct GenerateDataKeypairRequest {
    pub kms_creds: KmsCredentials,
    pub sealed_ikek: SealedIkek,
}

/// IKEK = Intermediate Key Encryption Key
#[derive(Clone, Serialize, Deserialize)]
#[serde(transparent)]
pub struct SealedIkek(pub Vec<u8>);

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(transparent)]
pub struct SealedIkekId(String);

impl SealedIkek {
    /// get an id from the sealed-ikek value
    pub fn id(&self) -> SealedIkekId {
        SealedIkekId(sha256(&self.0).encode_hex())
    }
}

impl Debug for SealedIkek {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SealedIkek( <omitted> )").finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EnvelopeDecryptRequest {
    pub kms_creds: KmsCredentials,
    pub sealed_key: crypto::aead::AeadSealedBytes,
    pub sealed_ikek: SealedIkek,
    pub requests: Vec<DecryptRequest>,
}

impl Debug for EnvelopeDecryptRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EnvelopeDecrypt")
            .field("kms_creds", &"<omitted>")
            .field("sealed_key", &"<omitted>")
            .field("requests", &self.requests)
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct DecryptRequest {
    pub sealed_data: EciesP256Sha256AesGcmSealed,
    pub transform: DataTransform,
}
impl Debug for DecryptRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("DecryptRequest")
            .field("sealed_data", &"<omitted>")
            .field("transform", &self.transform)
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EnvelopeHmacSignRequest {
    pub kms_creds: KmsCredentials,
    pub sealed_key: AeadSealedBytes,
    pub sealed_ikek: SealedIkek,
    pub scope: Vec<u8>,
    pub data: Vec<u8>,
}

impl Debug for EnvelopeHmacSignRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EnvelopeHmacSign")
            .field("kms_creds", &self.kms_creds)
            .field("sealed_key", &"<omitted>")
            .field("data", &"<omitted>")
            .field("scope", &self.scope)
            .finish()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct GenerateSymmetricDataKeyRequest {
    pub public_key_bytes: Vec<u8>,
}
