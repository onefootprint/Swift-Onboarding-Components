use thiserror::Error;

use crate::ne::kms_decrypt;
use crate::{EnvelopeDecrypt, FnDecryption, KmsCredentials};

#[derive(Error, Debug)]
pub enum Error {
    #[error("Enclave Error {0}")]
    EnclaveKmsError(#[from] crate::ne::Error),

    #[error("Crypto Error {0}")]
    CryptoError(#[from] crypto::Error),

    #[error("join {0}")]
    JoinError(#[from] tokio::task::JoinError),
}

pub async fn handle_fn_decrypt(request: EnvelopeDecrypt) -> Result<FnDecryption, Error> {
    let EnvelopeDecrypt {
        kms_creds,
        transform,
        public_key,
        sealed_key,
        sealed_data,
    } = request;

    let private_key_der = tokio::task::spawn_blocking(move || {
        let KmsCredentials {
            region,
            key_id,
            secret_key,
            session_token,
        } = kms_creds;
        kms_decrypt(
            region.as_bytes(),
            key_id.as_bytes(),
            secret_key.as_bytes(),
            session_token.as_bytes(),
            &sealed_key,
        )
    })
    .await??;

    let private_key_raw =
        crypto::conversion::private_key_der_to_raw_uncompressed(&private_key_der)?;

    let result = crypto::seal::unseal::unseal_ecies_p256_x963_sha256_aes_gcm(
        &private_key_raw,
        &public_key,
        sealed_data,
    )?;

    Ok(FnDecryption {
        data: result.0,
        transform,
    })
}
