use std::fmt::Debug;

use byteorder::{BigEndian, ByteOrder, WriteBytesExt};
use crypto::seal::EciesP256Sha256AesGcmSealed;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::io::{AsyncRead, AsyncReadExt};
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
    FnDecrypt(EnvelopeDecrypt),
    HmacSign(EnvelopeHmacSign),
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EnvelopeDecrypt {
    pub kms_creds: KmsCredentials,
    pub sealed_key: Vec<u8>,
    pub requests: Vec<DecryptRequest>,
}

impl Debug for EnvelopeDecrypt {
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
pub struct EnvelopeHmacSign {
    pub kms_creds: KmsCredentials,
    pub sealed_key: Vec<u8>,
    pub data: Vec<u8>,
    pub scope: Vec<u8>,
}

impl Debug for EnvelopeHmacSign {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EnvelopeHmacSign")
            .field("kms_creds", &self.kms_creds)
            .field("sealed_key", &"<omitted>")
            .field("data", &"<omitted>")
            .field("scope", &self.scope)
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct KmsCredentials {
    pub region: String,
    pub key_id: String,
    pub secret_key: String,
    pub session_token: Option<String>,
}
impl Debug for KmsCredentials {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("KmsCredentials")
            .field("region", &self.region)
            .field("key_id", &self.key_id)
            .field("secret_key", &"<omitted>")
            .field("session_token", &"<omitted>")
            .finish()
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "type")]
pub enum DataTransform {
    /// no transform, just the plain data
    Identity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnclaveResponse {
    pub request_id: Uuid,
    pub payload: EnclavePayload,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EnclavePayload {
    Pong(String),
    FnDecryption(FnDecryption),
    HmacSignature(HmacSignature),
    Error(String),
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

#[derive(Debug, Clone)]
pub struct WireMessage {
    length: usize,
    data: Vec<u8>,
}

#[derive(Error, Debug)]
pub enum Error {
    #[error("ser/de {0}")]
    Serialization(#[from] serde_cbor::Error),
    #[error("io {0}")]
    Io(#[from] std::io::Error),
    #[error("mismatched request id")]
    MismatchedRequest,
    #[error("unexpected response")]
    UnexpectedResponse,
    #[error("enclave returned error: {0}")]
    EnclaveError(String),
    #[error("Connection reset")]
    ConnectionReset,
    #[error("end stream")]
    StreamEnded,
}

impl WireMessage {
    pub fn from_request(s: &RpcRequest) -> Result<Self, Error> {
        Self::new(s)
    }

    pub fn from_response(s: &EnclaveResponse) -> Result<Self, Error> {
        Self::new(s)
    }

    fn new<S: Serialize>(s: &S) -> Result<Self, Error> {
        let data = serde_cbor::to_vec(s)?;
        Ok(Self {
            length: data.len(),
            data,
        })
    }

    pub fn request(&self) -> Result<RpcRequest, Error> {
        Ok(serde_cbor::from_slice(&self.data)?)
    }

    pub fn response(&self) -> Result<EnclaveResponse, Error> {
        let response: EnclaveResponse = serde_cbor::from_slice(&self.data)?;
        Ok(response)
    }

    pub fn to_bytes(self) -> Result<Vec<u8>, Error> {
        let mut len_bytes = vec![];
        len_bytes.write_u64::<BigEndian>(self.length as u64)?;
        Ok([len_bytes, self.data].concat())
    }

    fn from_buffer(amt: usize, buffer: &[u8]) -> Result<Option<WireMessage>, Error> {
        if amt < 8 {
            return Ok(None);
        }

        let length = BigEndian::read_u64(&buffer[..8]) as usize;

        if amt < 8 + length {
            return Ok(None);
        }

        Ok(Some(Self {
            length,
            data: buffer[8..(8 + length)].to_vec(),
        }))
    }

    pub async fn from_stream<S: AsyncRead + Unpin>(stream: &mut S) -> Result<WireMessage, Error> {
        let mut buffer = vec![0u8; 4096];
        let mut cursor = 0usize;

        loop {
            if let Some(wire) = Self::from_buffer(cursor, &buffer)? {
                return Ok(wire);
            }
            if buffer.len() == cursor {
                buffer.resize(cursor * 2, 0);
            }

            let n = stream.read(&mut buffer[cursor..]).await?;

            log::debug!("read {n} bytes");

            if 0 == n {
                if cursor == 0 {
                    return Err(Error::StreamEnded);
                } else {
                    return Err(Error::ConnectionReset);
                }
            } else {
                // Update our cursor
                cursor += n;
            }
        }
    }
}
