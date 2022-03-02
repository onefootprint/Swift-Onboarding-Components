pub mod b64;
pub mod conversion;
pub mod seal;

use std::str::Utf8Error;
use thiserror::Error;

pub use hex;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Bad key")]
    InvalidKey,

    #[error("Bad ciphertext")]
    InvalidCiphertext,

    #[error("Base64 Decoding Error")]
    Base64(#[from] base64::DecodeError),

    #[error("JSON coding Error")]
    Cbor(#[from] serde_cbor::Error),

    #[error("Crypto ring internal error")]
    Ring,

    #[error("Invalid utf8")]
    InvalidUtf8(#[from] Utf8Error),

    #[error("OpenSSL crypto error")]
    OpenSSL,
}

impl From<openssl::error::ErrorStack> for Error {
    fn from(_: openssl::error::ErrorStack) -> Self {
        Error::OpenSSL
    }
}

impl From<ring::error::Unspecified> for Error {
    fn from(_: ring::error::Unspecified) -> Self {
        Error::Ring
    }
}

pub mod util {
    pub fn safe_compare(a: &[u8], b: &[u8]) -> bool {
        let left = ring::digest::digest(&ring::digest::SHA256, a);
        let right = ring::digest::digest(&ring::digest::SHA256, b);
        left.as_ref() == right.as_ref()
    }
}
