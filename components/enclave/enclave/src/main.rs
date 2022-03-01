mod config;

use config::Config;
use enclave::{
    enclave::handle_fn_decrypt, EnclavePayload, EnclaveResponse, RpcPayload, RpcRequest,
    WireMessage,
};
use futures::StreamExt as _;
use tokio::{
    io::{AsyncRead, AsyncWrite, AsyncWriteExt},
    net::UnixListener,
};
use tokio_vsock::VsockListener;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    let config = Config::load_from_env().expect("failed to load env");

    // for local development, use a local unix socket instead of AF_VSOCK
    if let Some(path) = config.unix_sock {
        listen_unix_sock(&path).await
    } else {
        listen_vsock(config.port as u32).await
    }
}

async fn listen_unix_sock(path: &str) -> std::io::Result<()> {
    let listener = UnixListener::bind(path)?;
    log::info!("Listening for UNIX SOCKET connections at path: {path}");

    while let Some((stream, _)) = listener.accept().await.ok() {
        handle_stream(stream).await
    }

    Ok(())
}

async fn listen_vsock(port: u32) -> std::io::Result<()> {
    let listener = VsockListener::bind(libc::VMADDR_CID_ANY, port)?;

    log::info!("Listening for VSOCK connections on port: {}", port);

    let mut incoming = listener.incoming();
    while let Some(result) = incoming.next().await {
        match result {
            Ok(stream) => handle_stream(stream).await,
            Err(e) => {
                log::error!("Got error accepting connection: {:?}", e);
                return Err(e);
            }
        }
    }

    Ok(())
}

async fn handle_stream<S: AsyncRead + AsyncWrite + Unpin + Send + 'static>(stream: S) {
    log::info!("= new stream =");
    tokio::spawn(async move {
        let mut stream = stream;
        loop {
            match WireMessage::from_stream(&mut stream).await {
                Ok(None) => break,
                Ok(Some(message)) => {
                    let request = message.request().unwrap();
                    log::info!("got request {request:?}");

                    let response = handle_request(request).await.unwrap();
                    log::info!("proccessed response");
                    let out = WireMessage::new(&response).unwrap().to_bytes().unwrap();

                    stream.write_all(&out).await.unwrap();
                }
                Err(e) => {
                    log::error!("invalid message: {e}");
                }
            }
        }
    });
}

async fn handle_request(
    request: RpcRequest,
) -> Result<EnclaveResponse, Box<dyn std::error::Error>> {
    let response = match request.payload {
        RpcPayload::Ping(m) => EnclavePayload::Pong(m),
        RpcPayload::FnDecrypt(decrypt_request) => {
            EnclavePayload::FnDecryption(handle_fn_decrypt(decrypt_request).await?)
        }
    };

    Ok(response)
}
