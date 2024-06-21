pub mod aead;
pub mod conversion;
pub mod random;
pub mod seal;

use api_errors::FpErrorTrait;
pub use base64;
pub use hex;
use hmac::Hmac;
use hmac::Mac;
pub use pem;
pub use serde_cbor;
use sha2::Digest;
use sha2::Sha256;
use std::str::Utf8Error;
use thiserror::Error;
pub use zeroize;

mod clean_data;
pub use self::clean_data::*;

pub mod rsa_pksc1v15;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Bad key")]
    InvalidKey,

    #[error("Bad key length")]
    InvalidKeyLength,

    #[error("Bad ciphertext")]
    InvalidCiphertext,

    #[error("Base64 Decoding Error")]
    Base64(#[from] base64::DecodeError),

    #[error("CBOR coding Error")]
    Cbor(#[from] serde_cbor::Error),

    #[error("Invalid utf8")]
    InvalidUtf8(#[from] Utf8Error),

    #[error("ecc error")]
    Ecc(#[from] p256::elliptic_curve::Error),

    #[error("Invalid der public key")]
    InvalidDerP256PublicKey,

    #[error("Invalid sec1 public key")]
    InvalidSec1P256PublicKey,

    #[error("Invalid der private key")]
    InvalidDerP256PrivateKey,

    #[error("Aead operation failed")]
    Aead,

    #[error("Invalid Sha256 Digest Key Length")]
    Sha2DigestLength(#[from] sha2::digest::InvalidLength),

    #[error("rsa error: {0}")]
    RsaError(#[from] rsa_pksc1v15::Error),
}

impl FpErrorTrait for Error {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.to_string()
    }
}

/// safely compare to byte strings
pub fn safe_compare(a: &[u8], b: &[u8]) -> bool {
    sha256(a) == sha256(b)
}

pub fn sha256(input: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(input);
    let output = hasher.finalize();
    output.into()
}

pub fn hmac_sha256_sign(key: &[u8], data: &[u8]) -> Result<Vec<u8>, Error> {
    type HmacSha256 = Hmac<Sha256>;

    let mut mac = HmacSha256::new_from_slice(key)?;
    mac.update(data);
    let result = mac.finalize();
    let code_bytes = result.into_bytes();
    Ok(code_bytes.to_vec())
}
