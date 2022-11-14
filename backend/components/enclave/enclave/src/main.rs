mod config;

use config::Config;
use enclave::{
    enclave::handle_fn_decrypt,
    enclave::{init as init_enclave_sdk, handle_generate_symmetric_data_key},
    enclave::{handle_generate_data_keypair, handle_hmac_sign},
    EnclavePayload, EnclaveResponse, RpcPayload, WireMessage,
};

#[allow(unused_imports)]
use futures::StreamExt as _;
use tokio::{
    io::{AsyncRead, AsyncWrite, AsyncWriteExt},
    net::TcpListener,
};

#[cfg(feature = "nitro")]
use tokio_vsock::VsockListener;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    let config = Config::load_from_env().expect("failed to load env");

    init_enclave_sdk();

    // for local development, use a local tcp socket instead of AF_VSOCK
    #[cfg(not(feature = "nitro"))]
    {
        listen_tcp(&format!("127.0.0.1:{}", config.port)).await
    }

    #[cfg(feature = "nitro")]
    {
        if config.use_local.is_some() {
            listen_tcp(&format!("127.0.0.1:{}", config.port)).await
        } else {
            // spawn our loop to start seeding entropy via the NSM
            enclave::enclave::spawn_seed_entropy_loop();

            listen_vsock(config.port as u32).await
        }
    }
}

async fn listen_tcp(address: &str) -> std::io::Result<()> {
    let listener = TcpListener::bind(address).await?;
    log::info!("Listening for TCP connections at path: {address}");

    while let Ok((stream, _)) = listener.accept().await {
        stream_listen(stream)
    }

    Ok(())
}

#[cfg(feature = "nitro")]
async fn listen_vsock(port: u32) -> std::io::Result<()> {
    let listener = VsockListener::bind(libc::VMADDR_CID_ANY, port)?;

    log::info!("Listening for VSOCK connections on port: {}", port);

    let mut incoming = listener.incoming();
    while let Some(result) = incoming.next().await {
        match result {
            Ok(stream) => stream_listen(stream),
            Err(e) => {
                log::info!("Got error accepting connection: {:?}", e);
                return Err(e);
            }
        }
    }

    Ok(())
}

fn stream_listen<S: AsyncRead + AsyncWrite + Unpin + Send + 'static>(stream: S) {
    log::debug!("= new stream open =");
    tokio::spawn(async move {
        let mut stream = stream;
        loop {
            match handle_stream(&mut stream).await {
                Ok(_) => continue,
                Err(e) => {
                    log::error!("handle stream error: {:?}", e);
                    return;
                }
            }
        }
    });
}

async fn handle_stream<S: AsyncRead + AsyncWrite + Unpin + Send + 'static>(
    stream: &mut S,
) -> Result<(), enclave::Error> {
    let message = WireMessage::from_stream(stream).await?;
    let request = message.request()?;
    log::debug!("got request {request:?}");

    let response_payload = match handle_request(request.payload).await {
        Ok(response) => response,
        Err(error) => {
            log::error!("got error handling request: {error:?}");
            EnclavePayload::Error(format!("{error:?}"))
        }
    };

    log::debug!("successfully created response payload");

    let response = EnclaveResponse {
        payload: response_payload,
        request_id: request.id,
    };

    let out = WireMessage::from_response(&response)?.to_bytes()?;

    stream.write_all(&out).await?;
    stream.flush().await?;

    log::debug!("wrote stream");

    Ok(())
}

async fn handle_request(request: RpcPayload) -> Result<EnclavePayload, Box<dyn std::error::Error>> {
    let response = match request {
        RpcPayload::Ping(m) => EnclavePayload::Pong(m),
        RpcPayload::GenerateDataKeypair(generate_request) => {
            EnclavePayload::GenerateDataKeyPair(handle_generate_data_keypair(generate_request).await?)
        }
        RpcPayload::GenerateSymmetricDataKey(generate_sym_request) => {
            EnclavePayload::GenerateSymmetricDataKey(handle_generate_symmetric_data_key(generate_sym_request).await?)
        }
        RpcPayload::HmacSign(sign_request) => {
            EnclavePayload::HmacSignature(handle_hmac_sign(sign_request).await?)
        }
        RpcPayload::FnDecrypt(decrypt_request) => {
            EnclavePayload::FnDecryption(handle_fn_decrypt(decrypt_request).await?)
        }
    };

    Ok(response)
}
