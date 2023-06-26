use thiserror::Error;

use crate::DataTransform;

#[derive(Error, Debug)]
pub enum TransformError {
    #[error("failed cryptographic operation: {0}")]
    CryptoError(#[from] crypto::Error),
}

impl DataTransform {
    /// applies the transform to a data input
    pub fn apply(&self, data: Vec<u8>) -> Result<Vec<u8>, TransformError> {
        let out = match self {
            DataTransform::Identity => data,
            DataTransform::HmacSha256 { key } => crypto::hex::encode(crypto::hmac_sha256_sign(key, &data)?)
                .as_bytes()
                .to_vec(),
        };

        Ok(out)
    }

    pub fn apply_str<T: From<String>>(&self, data: &str) -> Result<T, TransformError> {
        let string = match self {
            DataTransform::Identity => data.to_string(),
            DataTransform::HmacSha256 { key } => {
                crypto::hex::encode(crypto::hmac_sha256_sign(key, data.as_bytes())?)
            }
        };
        Ok(T::from(string))
    }
}
