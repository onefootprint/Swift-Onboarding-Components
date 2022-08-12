use actix_web::{middleware::Logger, post, web, App, HttpServer, Responder, ResponseError};
use config::Config;
use enclave_proxy::*;
use futures::TryFutureExt;
use rpc::{EnclavePayload, RpcRequest};
use thiserror::Error;

#[derive(Clone)]
pub struct State {
    pool: bb8::Pool<pool::StreamManager<StreamManager<Config>>>,
}

#[derive(Debug, Error)]
#[error("enclave proxy error {0}")]
pub struct EnclaveProxyError(enclave_proxy::Error);
impl From<enclave_proxy::Error> for EnclaveProxyError {
    fn from(e: enclave_proxy::Error) -> Self {
        Self(e)
    }
}

impl ResponseError for EnclaveProxyError {}

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    env_logger::init();
    let config = config::Config::load_from_env().expect("failed to load config");
    let manager = StreamManager {
        config: config.clone(),
    };
    let pool = bb8::Pool::builder()
        .min_idle(Some(3))
        .max_size(5)
        .build(pool::StreamManager(manager))
        .await
        .unwrap();

    let state = web::Data::new(State { pool });

    log::info!("Starting enclave_parent on port {}", config.port);

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .wrap(Logger::default())
            .service(proxy)
    })
    .bind(("0.0.0.0", config.port))?
    .run()
    .await
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProxyPayload {
    request: RpcRequest,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProxyPayloadResponse {
    response: EnclavePayload,
}

#[post("/proxy")]
async fn proxy(
    state: web::Data<State>,
    request: web::Json<ProxyPayload>,
) -> actix_web::Result<impl Responder> {
    log::info!("got proxy request");

    // local development, we use a unix socket
    let mut conn = state.pool.get().await.unwrap();
    let response = enclave_proxy::send_rpc_request(&request.request, &mut conn)
        .map_err(EnclaveProxyError)
        .await?;

    Ok(web::Json(ProxyPayloadResponse { response }))
}
