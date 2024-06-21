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


impl api_errors::FpErrorTrait for EnclaveError {
    fn status_code(&self) -> api_errors::StatusCode {
        match self {
            Self::Enclave(enclave_proxy::EnclaveError::EnclaveError(err))
                if err.starts_with("TransformError") =>
            {
                api_errors::StatusCode::BAD_REQUEST
            } /* a little hacky, but for */
            _ => api_errors::StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
