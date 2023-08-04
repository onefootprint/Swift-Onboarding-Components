use enclave_proxy::bb8;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum EnclaveError {
    #[error("enclave proxy error: {0}")]
    EnclaveProxy(#[from] enclave_proxy::Error),
    #[error("enclave conn error: {0}")]
    EnclaveConnection(#[from] bb8::RunError<enclave_proxy::Error>),
    #[error("enclave error: {0}")]
    Enclave(#[from] enclave_proxy::EnclaveError),
    #[error("invalid enclave decrypt response")]
    InvalidEnclaveDecryptResponse,
    #[error("invalid enclave fingerprint response")]
    InvalidEnclaveFingerprintResponse,
    #[error("cannot decode decrypted result from utf8 error: {0}")]
    CannotDecodeUtf8(#[from] std::str::Utf8Error),
    #[error("crypto error: {0}")]
    CryptoError(#[from] crypto::Error),
    #[cfg(test)]
    #[error("error in test: {0}")]
    TestError(String),
}
