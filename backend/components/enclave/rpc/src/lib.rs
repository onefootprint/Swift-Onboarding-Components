use byteorder::{
    BigEndian,
    ByteOrder,
    WriteBytesExt,
};
use serde::Serialize;
use std::fmt::Debug;
use thiserror::Error;
use tokio::io::{
    AsyncRead,
    AsyncReadExt,
};

mod request;
mod response;
mod transform;
pub use transform::*;

mod types;
pub use self::request::*;
pub use self::response::*;
pub use self::types::*;

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
        let mut len_bytes: Vec<u8> = vec![];
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
