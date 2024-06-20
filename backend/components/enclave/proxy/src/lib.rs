pub mod config;
pub mod http_proxy;
pub mod pool;

use async_trait::async_trait;
pub use bb8;
pub use config::Config;
use pool::Stream;
use pool::StreamConnection;
pub use rpc::DataTransform;
pub use rpc::DataTransformer;
pub use rpc::DataTransforms;
pub use rpc::DecryptRequest;
pub use rpc::DecryptThenSignRequest;
pub use rpc::Decryption;
pub use rpc::EnclavePayload;
pub use rpc::EnclaveResponse;
pub use rpc::EncryptTransformAlgorithm;
pub use rpc::EnvelopeDecryptRequest;
pub use rpc::EnvelopeDecryptThenHmacSignRequest;
pub use rpc::EnvelopeHmacSignRequest;
pub use rpc::Error as EnclaveError;
pub use rpc::GenerateDataKeypairRequest;
pub use rpc::GenerateSymmetricDataKeyRequest;
pub use rpc::GeneratedDataKeyPair;
pub use rpc::GeneratedSealedDataKey;
pub use rpc::HmacSignature;
pub use rpc::KmsCredentials;
pub use rpc::RpcPayload;
pub use rpc::RpcRequest;
pub use rpc::SealedIkek;
pub use rpc::Sealing;
pub use rpc::SignRequest;
pub use rpc::Signing;
pub use rpc::TransformError;
use rpc::WireMessage;
use thiserror::Error;
use tokio::io::AsyncWriteExt;

pub type EnclaveConnectionPool = bb8::Pool<pool::StreamManager<StreamManager<Config>>>;

#[cfg(feature = "vsock")]
use tokio_vsock::VsockStream;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Enclave {0}")]
    EnclaveRpc(#[from] rpc::Error),
    #[error("IO {0}")]
    Io(#[from] std::io::Error),
    #[error("Unexpected enclave response payload")]
    UnexpectedEnclaveResponse,
    #[error("No enclave response")]
    MissingEnclaveResponse,
    #[error("No enclave response")]
    InvalidEnclaveResponse,
    #[error("Http reqwest: {0}")]
    HttpClient(#[from] reqwest::Error),
    #[error("Http reqwest middleware: {0}")]
    HttpClientMiddleware(#[from] reqwest_middleware::Error),
    #[error("Invalid HTTP response {0}")]
    HttpError(u16),
}

#[derive(Debug, Clone)]
pub enum StreamType {
    Tcp {
        address: String,
    },

    #[cfg(feature = "vsock")]
    Vsock {
        cid: u32,
        port: u32,
    },
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
            StreamType::Tcp { address } => {
                let stream = tokio::net::TcpStream::connect(&address).await?;
                log::info!("connected to LOCAL TCP based enclave");
                Box::new(stream)
            }
            #[cfg(feature = "vsock")]
            StreamType::Vsock { cid, port } => {
                let stream = VsockStream::connect(cid, port).await?;
                log::info!("connected to VSOCK based enclave");
                Box::new(stream)
            }
        };
        Ok(stream)
    }

    async fn ping(&self, stream: &mut Box<dyn Stream>) -> Result<(), Error> {
        let request = RpcRequest::new(RpcPayload::Ping("health_ping".to_string()));
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
    stream.flush().await?;

    loop {
        tracing::info!("before reading enclave response stream");
        let response = WireMessage::from_stream(stream).await?.response()?;

        if response.request_id != request.id {
            tracing::info!("request.id != response.request_id");
            continue;
        }

        return Ok(response.payload);
    }
}
