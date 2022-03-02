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

    #[error("Invalid utf8")]
    InvalidUtf8(#[from] Utf8Error),

    #[error("ecc error {0}")]
    Ecc(#[from] elliptic_curve::Error),

    #[error("Invalid der public key")]
    InvalidDerP256PublicKey,

    #[error("aead encrypt failed")]
    AeadEncrypt,
}
