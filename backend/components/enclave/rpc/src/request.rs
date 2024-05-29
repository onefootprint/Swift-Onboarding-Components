use crate::types::KmsCredentials;
use crate::DataTransform;
use crypto::hex::ToHex;
use crypto::seal::EciesP256Sha256AesGcmSealed;
use crypto::sha256;
use serde::{
    Deserialize,
    Serialize,
};
use std::fmt::Debug;
use std::marker::PhantomData;
use uuid::Uuid;

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
    Decrypt(EnvelopeDecryptRequest),
    HmacSign(EnvelopeHmacSignRequest),
    DecryptThenHmacSign(EnvelopeDecryptThenHmacSignRequest),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct GenerateDataKeypairRequest {
    pub kms_creds: KmsCredentials,
    pub sealed_ikek: SealedIkek<Sealing>,
}

/// IKEK = Intermediate Key Encryption Key
#[derive(Clone, Serialize, Deserialize)]
pub struct SealedIkek<Purpose> {
    pub bytes: Vec<u8>,
    purpose: PhantomData<Purpose>,
}

/// Represents decryption use
#[derive(Clone, Serialize, Deserialize, Copy)]
pub struct Sealing(PhantomData<()>);

impl SealedIkek<Sealing> {
    pub fn new(bytes: Vec<u8>) -> Self {
        Self {
            bytes,
            purpose: PhantomData,
        }
    }
}

/// Represents signing use
#[derive(Clone, Serialize, Deserialize, Copy)]
pub struct Signing(PhantomData<()>);

impl SealedIkek<Signing> {
    pub fn new(bytes: Vec<u8>) -> Self {
        Self {
            bytes,
            purpose: PhantomData,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(transparent)]
pub struct SealedIkekId(String);

impl<P> SealedIkek<P> {
    /// get an id from the sealed-ikek value
    pub fn id(&self) -> SealedIkekId {
        SealedIkekId(sha256(&self.bytes).encode_hex())
    }
}

impl<P> Debug for SealedIkek<P> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SealedIkek( <omitted> )").finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EnvelopeDecryptRequest {
    pub kms_creds: KmsCredentials,
    pub sealed_ikek: SealedIkek<Sealing>,
    pub requests: Vec<DecryptRequest>,
}

impl Debug for EnvelopeDecryptRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EnvelopeDecryptRequest")
            .field("kms_creds", &"<omitted>")
            .field("requests", &self.requests)
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct DecryptRequest {
    pub sealed_data: EciesP256Sha256AesGcmSealed,
    pub sealed_key: crypto::aead::AeadSealedBytes,
    pub transforms: Vec<DataTransform>,
}

impl Debug for DecryptRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("DecryptRequest")
            .field("sealed_data", &"<omitted>")
            .field("sealed_key", &"<omitted>")
            .field("transforms", &"<omitted>")
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EnvelopeHmacSignRequest {
    pub kms_creds: KmsCredentials,
    pub sealed_ikek: SealedIkek<Signing>,
    pub requests: Vec<SignRequest>,
}

impl Debug for EnvelopeHmacSignRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EnvelopeHmacSign")
            .field("kms_creds", &self.kms_creds)
            .field("requests", &self.requests)
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct SignRequest {
    pub scope: Vec<u8>,
    pub data: Vec<u8>,
}

impl Debug for SignRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SignRequest")
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

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EnvelopeDecryptThenHmacSignRequest {
    pub kms_creds: KmsCredentials,
    pub sealed_key: crypto::aead::AeadSealedBytes,
    pub signing_ikek: SealedIkek<Signing>,
    pub sealing_ikek: SealedIkek<Sealing>,
    pub requests: Vec<DecryptThenSignRequest>,
}

impl Debug for EnvelopeDecryptThenHmacSignRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EnvelopeDecryptThenHmacSignRequest")
            .field("kms_creds", &"<omitted>")
            .field("sealed_key", &"<omitted>")
            .field("requests", &self.requests)
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct DecryptThenSignRequest {
    pub sealed_data: EciesP256Sha256AesGcmSealed,
    pub scope: Vec<u8>,
}

impl Debug for DecryptThenSignRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SignRequest")
            .field("data", &"<omitted>")
            .field("scope", &self.scope)
            .finish()
    }
}
