use byteorder::{BigEndian, ByteOrder, WriteBytesExt};
use serde::{Deserialize, Serialize};
use tokio::io::{AsyncRead, AsyncReadExt};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Message {
    Ping(String),
    Pong(String),
}

#[derive(Debug, Clone)]
pub struct WireMessage {
    length: usize,
    data: Vec<u8>,
}

impl WireMessage {
    pub fn new(s: &Message) -> Result<Self, serde_cbor::Error> {
        let data = serde_cbor::to_vec(s)?;
        Ok(Self {
            length: data.len(),
            data,
        })
    }

    pub fn message(&self) -> Result<Message, serde_cbor::Error> {
        Ok(serde_cbor::from_slice(&self.data)?)
    }

    pub fn to_bytes(self) -> Result<Vec<u8>, std::io::Error> {
        let mut len_bytes = vec![];
        len_bytes.write_u64::<BigEndian>(self.length as u64)?;
        Ok([len_bytes, self.data].concat())
    }

    pub async fn from_stream<S: AsyncRead + Unpin>(
        stream: &mut S,
    ) -> std::io::Result<Option<WireMessage>> {
        let mut length_bytes = vec![0u8; 8];
        let n = stream.read(&mut length_bytes).await?;
        if n == 0 {
            return Ok(None);
        }

        let length = BigEndian::read_u64(&length_bytes) as usize;
        let mut data = vec![0u8; length];
        let _ = stream.read_exact(&mut data).await?;

        Ok(Some(Self { length, data }))
    }
}
