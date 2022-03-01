mod config;
mod pool;

use actix_web::{middleware::Logger, post, web, App, HttpServer, Responder};
use async_trait::async_trait;
use config::Config;
use enclave::{EnclaveResponse, RpcRequest, WireMessage};
use pool::{Stream, StreamConnection};

use tokio::{io::AsyncWriteExt, net::UnixStream};
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

    async fn ping(&self, stream: &mut Box<dyn Stream>) -> Result<(), tokio::io::Error> {
        let message = RpcRequest::Ping(format!("test"));
        match handle_message(&message, stream).await {
            Ok(Some(EnclaveResponse::Pong(_))) => Ok(()),
            Ok(None) => Err(tokio::io::ErrorKind::NotFound)?,
            Err(e) => Err(e),
        }
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
    message: RpcRequest,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProxyPayloadResponse {
    message: Option<EnclaveResponse>,
}

#[post("/proxy")]
async fn proxy(
    state: web::Data<State>,
    message: web::Json<ProxyPayload>,
) -> actix_web::Result<impl Responder> {
    log::info!("got proxy request");

    // local development, we use a unix socket
    let mut conn = state.pool.get().await.unwrap();
    let response = handle_message(&message.message, &mut conn).await?;

    Ok(web::Json(ProxyPayloadResponse { message: response }))
}

async fn handle_message(
    message: &RpcRequest,
    stream: &mut Box<dyn Stream>,
) -> std::io::Result<Option<EnclaveResponse>> {
    let message = WireMessage::new(message).unwrap().to_bytes()?;
    stream.write_all(&message).await?;

    let response = WireMessage::from_stream(stream)
        .await?
        .map(|wm| wm.response().unwrap());

    Ok(response)
}
