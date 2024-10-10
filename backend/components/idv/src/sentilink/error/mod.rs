use error_code::SentilinkErrorCode;
use newtypes::output::Csv;
use newtypes::sentilink::SentilinkProduct;
use newtypes::IdentityDataKind;

pub mod error_code;


#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Sentilink reqwest middleware error: {0}")]
    ReqwestMiddlewareError(#[from] reqwest_middleware::Error),
    #[error("Sentilink reqwest error: {0} http status: {1}")]
    ReqwestErrorWithCode(reqwest::Error, u16),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("Sentilink http error {0}")]
    HttpError(u16),
    #[error("Sentilink error received {0}")]
    ErrorCode(SentilinkErrorCode),
    #[error("Sentilink unknown error")]
    UnknownError(String),
    #[error("MissingRequiredFields: {0:?}")]
    MissingRequiredFields(Vec<(SentilinkProduct, Csv<IdentityDataKind>)>),
    #[error("MissingRequiredField: {0}")]
    MissingRequiredField(IdentityDataKind),
    #[error("AssertionError: {0}")]
    AssertionError(String),
    #[error("Missing score {0:?}")]
    MissingScore(SentilinkProduct),
    #[error("Unsupported country")]
    UnsupportedCountry,
}
