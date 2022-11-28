use super::client::*;
use crate::{config::Config, pool, StreamManager};
use actix_web::{dev::Server, get, middleware::Logger, post, web, App, HttpServer, Responder, ResponseError};
use actix_web_httpauth::extractors::bearer::BearerAuth;

use futures::TryFutureExt;
use rpc::{EnclavePayload, RpcPayload, RpcRequest};
use thiserror::Error;

#[derive(Clone)]
pub struct State {
    pool: bb8::Pool<pool::StreamManager<StreamManager<Config>>>,
    config: Config,
}

#[derive(Debug, Error)]
#[error("enclave proxy error {0}")]
pub struct EnclaveProxyError(crate::Error);
impl From<crate::Error> for EnclaveProxyError {
    fn from(e: crate::Error) -> Self {
        Self(e)
    }
}

impl ResponseError for EnclaveProxyError {}

pub async fn build_server(config: Config) -> std::io::Result<Server> {
    let manager = StreamManager {
        config: config.clone(),
    };
    let pool = bb8::Pool::builder()
        .min_idle(Some(3))
        .max_size(50)
        .connection_timeout(std::time::Duration::from_secs(4))
        .test_on_check_out(true)
        .error_sink(Box::new(EnclavePoolErrorSink))
        .build(pool::StreamManager(manager))
        .await
        .expect("could not create enclave conn pool");

    let port = config.port;
    let state = web::Data::new(State { pool, config });

    log::info!("Starting enclave_parent on port {}", port);

    let server = HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .wrap(Logger::default())
            .service(health)
            .service(proxy)
    })
    .bind(("0.0.0.0", port))?
    .run();

    Ok(server)
}

pub async fn run(config: Config) -> Result<(), std::io::Error> {
    build_server(config).await?.await?;
    Ok(())
}

/// Record errors that occur from enclave pool connections
#[derive(Debug, Clone)]
struct EnclavePoolErrorSink;
impl bb8::ErrorSink<crate::Error> for EnclavePoolErrorSink {
    fn sink(&self, error: crate::Error) {
        tracing::error!(target: "enclave_pool_error", error=?error, "enclave connection pool error");
    }

    fn boxed_clone(&self) -> Box<(dyn bb8::ErrorSink<crate::Error> + 'static)> {
        Box::new(self.clone())
    }
}

#[get("/health")]
async fn health(state: web::Data<State>) -> actix_web::Result<impl Responder> {
    let mut conn = state
        .pool
        .get()
        .await
        .map_err(|e| actix_web::error::ErrorBadGateway(format!("enclave pool error: {:?}", e)))?;

    let request = RpcRequest::new(RpcPayload::Ping("ping".into()));

    let response = crate::send_rpc_request(&request, &mut conn)
        .map_err(EnclaveProxyError)
        .await?;

    if let EnclavePayload::Pong(_) = response {
        Ok("ok")
    } else {
        Err(actix_web::error::ErrorInternalServerError(
            "invalid enclave response type".to_string(),
        ))
    }
}

#[post("/proxy")]
async fn proxy(
    state: web::Data<State>,
    request: web::Json<ProxyPayloadRequest>,
    auth: BearerAuth,
) -> actix_web::Result<impl Responder> {
    log::info!("got proxy request");

    if !crypto::safe_compare(auth.token().as_bytes(), state.config.proxy_secret.as_bytes()) {
        log::error!("proxy authentication failed");
        return Err(actix_web::error::ErrorUnauthorized("invalid token"));
    }

    let mut conn = state
        .pool
        .get()
        .await
        .map_err(|e| actix_web::error::ErrorBadGateway(format!("enclave pool error: {:?}", e)))?;

    let response = crate::send_rpc_request(&request.request, &mut conn)
        .map_err(EnclaveProxyError)
        .await?;

    Ok(web::Json(ProxyPayloadResponse { response }))
}
