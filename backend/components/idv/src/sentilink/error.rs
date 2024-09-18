use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Sentilink reqwest middleware error: {0}")]
    ReqwestMiddlewareError(#[from] reqwest_middleware::Error),
}
