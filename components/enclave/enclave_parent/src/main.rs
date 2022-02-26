mod config;
use actix_web::{middleware::Logger, post, web, App, HttpServer, Responder};
use config::Config;
use enclave::{Message, WireMessage};
use tokio::{
    io::{AsyncRead, AsyncWrite, AsyncWriteExt},
    net::UnixStream,
};
use tokio_vsock::VsockStream;

#[derive(Clone)]
pub struct State {
    config: Config,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    let config = config::Config::load_from_env().expect("failed to load config");
    let state = web::Data::new(State {
        config: config.clone(),
    });

    log::info!("Starting enclave_parent on port {}", config.port);

    let res = HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .wrap(Logger::default())
            .service(proxy)
    })
    .bind(("0.0.0.0", config.port))?
    .run()
    .await;

    res
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProxyPayload {
    message: Message,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProxyPayloadResponse {
    message: Option<Message>,
}

#[post("/proxy")]
async fn proxy(
    state: web::Data<State>,
    message: web::Json<ProxyPayload>,
) -> actix_web::Result<impl Responder> {
    log::info!("got proxy request");

    // local development, we use a unix socket
    let response = if let Some(path) = &state.config.unix_sock {
        let stream = UnixStream::connect(path).await?;
        handle_message(&message.message, stream).await?
    } else {
        let stream = VsockStream::connect(3, state.config.enclave_port).await?;
        handle_message(&message.message, stream).await?
    };

    Ok(web::Json(ProxyPayloadResponse { message: response }))
}

async fn handle_message<S: AsyncRead + AsyncWrite + Unpin>(
    message: &Message,
    mut stream: S,
) -> std::io::Result<Option<Message>> {
    let message = WireMessage::new(message).unwrap().to_bytes()?;
    stream.write_all(&message).await?;

    let response = WireMessage::from_stream(&mut stream)
        .await?
        .map(|wm| wm.message().unwrap());

    Ok(response)
}
