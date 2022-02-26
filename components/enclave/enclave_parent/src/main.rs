mod config;
mod pool;
use std::sync::Arc;

use actix_web::{middleware::Logger, post, web, App, HttpServer, Responder};
use async_trait::async_trait;
use config::Config;
use enclave::{Message, WireMessage};
use pool::{Stream, StreamConnection};

use tokio::{
    io::{AsyncRead, AsyncWrite, AsyncWriteExt},
    net::UnixStream,
    sync::Mutex,
};
use tokio_vsock::VsockStream;

#[derive(Clone)]
pub struct State {
    config: Config,
    pool: bb8::Pool<pool::StreamManager<StreamManager>>,
}

#[derive(Clone)]
pub struct StreamManager {
    config: Config,
}

#[async_trait]
impl StreamConnection for StreamManager {
    async fn new_stream(&self) -> Result<Box<dyn Stream>, tokio::io::Error> {
        let stream: Box<dyn Stream> = if let Some(path) = &self.config.unix_sock {
            let stream = UnixStream::connect(path).await?;
            log::info!("connected to unix socket based enclave");
            Box::new(stream)
        } else {
            let stream =
                VsockStream::connect(self.config.enclave_cid, self.config.enclave_port).await?;
            log::info!("connected to VSOCK based enclave");
            Box::new(stream)
        };
        Ok(stream)
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    let config = config::Config::load_from_env().expect("failed to load config");
    let manager = StreamManager {
        config: config.clone(),
    };
    let pool = bb8::Pool::builder()
        .min_idle(Some(3))
        .max_size(5)
        .build(pool::StreamManager(manager))
        .await?;

    let state = web::Data::new(State {
        config: config.clone(),
        pool,
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
    let mut stream = state.pool.get().await.unwrap();
    let response = handle_message(&message.message, stream.as_mut()).await?;

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
