pub mod b64;
pub mod conversion;
pub mod seal;
pub mod random;

use hmac::Hmac;
use sha2::{Digest, Sha256};
use std::str::Utf8Error;
use thiserror::Error;

pub use hex;
use hmac::Mac;

pub use serde_cbor;

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

    #[error("Invalid der private key")]
    InvalidDerP256PrivateKey,

    #[error("aead encrypt failed")]
    AeadEncrypt,

    #[error("Invalid Sha256 Digest Key Length")]
    Sha2DigestLength(#[from] sha2::digest::InvalidLength),
}

pub fn sha256(input: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(&input);
    let output = hasher.finalize();
    output.into()
}

pub fn hmac_sha256_sign(key: &[u8], data: &[u8]) -> Result<Vec<u8>, Error> {
    type HmacSha256 = Hmac<Sha256>;

    let mut mac = HmacSha256::new_from_slice(key)?;
    mac.update(data);
    let result = mac.finalize();
    let code_bytes = result.into_bytes();
    return Ok(code_bytes.to_vec());
}
