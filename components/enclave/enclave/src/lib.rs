use byteorder::{BigEndian, ByteOrder, WriteBytesExt};
use crypto::seal::EciesP256Sha256AesGcmSealed;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::io::{AsyncRead, AsyncReadExt};
use uuid::Uuid;

pub mod enclave;

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
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EnvelopeDecrypt {
    pub kms_creds: KmsCredentials,
    pub transform: DataTransform,
    pub sealed_key: Vec<u8>,
    pub sealed_data: EciesP256Sha256AesGcmSealed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KmsCredentials {
    pub region: String,
    pub key_id: String,
    pub secret_key: String,
    pub session_token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct FnDecryption {
    pub transform: DataTransform,
    pub data: Vec<u8>,
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

    pub fn response(&self, request_id: Uuid) -> Result<EnclaveResponse, Error> {
        let response: EnclaveResponse = serde_cbor::from_slice(&self.data)?;
        if response.request_id != request_id {
            return Err(Error::MismatchedRequest);
        }

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
