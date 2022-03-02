pub mod config;
pub mod pool;

use async_trait::async_trait;
pub use bb8;
pub use config::Config;
use enclave::WireMessage;
pub use enclave::{
    DataTransform, EnclavePayload, EnclaveResponse, EnvelopeDecrypt, FnDecryption, KmsCredentials,
    RpcPayload, RpcRequest,
};
use pool::{Stream, StreamConnection};

use thiserror::Error;
use tokio::{io::AsyncWriteExt, net::UnixStream};
use tokio_vsock::VsockStream;

#[derive(Error, Debug)]
pub enum Error {
    #[error("enclave {0}")]
    Enclave(#[from] enclave::Error),
    #[error("io {0}")]
    Io(#[from] std::io::Error),
    #[error("unexpected enclave response payload")]
    UnexpectedEnclaveResponse,
    #[error("no enclave response")]
    MissingEnclaveResponse,
    #[error("no enclave response")]
    InvalidEnclaveResponse,
}

#[derive(Debug, Clone)]
pub enum StreamType {
    UnixSocket(String),
    Vsock { cid: u32, port: u32 },
}

pub trait StreamConfig {
    fn stream_type(&self) -> StreamType;
}

#[derive(Clone)]
pub struct StreamManager<T> {
    pub config: T,
}

#[async_trait]
impl<T> StreamConnection for StreamManager<T>
where
    T: StreamConfig + Send + Sync,
{
    async fn new_stream(&self) -> Result<Box<dyn Stream>, Error> {
        let stream: Box<dyn Stream> = match self.config.stream_type() {
            StreamType::UnixSocket(path) => {
                let stream = UnixStream::connect(path).await?;
                log::info!("connected to unix socket based enclave");
                Box::new(stream)
            }
            StreamType::Vsock { cid, port } => {
                let stream = VsockStream::connect(cid, port).await?;
                log::info!("connected to VSOCK based enclave");
                Box::new(stream)
            }
        };
        Ok(stream)
    }

    async fn ping(&self, stream: &mut Box<dyn Stream>) -> Result<(), Error> {
        let request = RpcRequest::new(RpcPayload::Ping(format!("test")));
        match send_rpc_request(&request, stream).await {
            Ok(EnclavePayload::Pong(_)) => Ok(()),
            Ok(_) => Err(Error::UnexpectedEnclaveResponse),
            Err(e) => Err(e),
        }
    }
}

pub async fn send_rpc_request(
    request: &RpcRequest,
    stream: &mut Box<dyn Stream>,
) -> Result<EnclavePayload, Error> {
    let message = WireMessage::from_request(request)?.to_bytes()?;
    stream.write_all(&message).await?;

    let response = WireMessage::from_stream(stream)
        .await?
        .ok_or(Error::MissingEnclaveResponse)?
        .response(request.id)?;

    Ok(response.payload)
}
