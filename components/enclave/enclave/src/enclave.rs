use rpc::{EnvelopeHmacSign, HmacSignature};
use thiserror::Error;

#[cfg(feature = "simulate")]
mod simulated;

#[cfg(feature = "nitro")]
mod ne;

use crate::{EnvelopeDecrypt, FnDecryption, KmsCredentials};

#[derive(Error, Debug)]
pub enum Error {
    #[cfg(feature = "simulate")]
    #[error("Enclave Error {0}")]
    SimulateEnclaveKmsError(#[from] simulated::Error),

    #[cfg(feature = "nitro")]
    #[error("Enclave Error {0}")]
    NitroEnclaveKmsError(#[from] ne::Error),

    #[error("Crypto Error {0}")]
    CryptoError(#[from] crypto::Error),
}

pub async fn handle_fn_decrypt(request: EnvelopeDecrypt) -> Result<FnDecryption, Error> {
    let EnvelopeDecrypt {
        kms_creds,
        transform,
        sealed_key,
        sealed_data,
    } = request;

    let private_key_der = kms_decrypt(kms_creds, sealed_key).await?;
    log::info!("decrypted vault private key",);

    let private_key_raw =
        crypto::conversion::private_key_der_to_raw_uncompressed(&private_key_der)?;

    log::info!("converted private key from DER");

    let result =
        crypto::seal::unseal::unseal_ecies_p256_x963_sha256_aes_gcm(&private_key_raw, sealed_data)?;

    log::info!("unsealed ciphertext");

    Ok(FnDecryption {
        data: result.0,
        transform,
    })
}

pub async fn handle_hmac_sign(request: EnvelopeHmacSign) -> Result<HmacSignature, Error> {
    let EnvelopeHmacSign {
        kms_creds,
        sealed_key,
        data,
        scope,
    } = request;

    let root_signing_key = kms_decrypt(kms_creds, sealed_key).await?;
    log::info!("decrypted signature hmac key",);

    // our scoped key is SHA256(scope || root_signing_key)
    let scoped_key = crypto::sha256(&vec![scope, root_signing_key].concat());
    let signature = crypto::hmac_sha256_sign(&scoped_key, &data)?;

    Ok(HmacSignature { signature })
}

#[allow(unreachable_code)]
pub async fn kms_decrypt(kms_creds: KmsCredentials, ciphertext: Vec<u8>) -> Result<Vec<u8>, Error> {
    #[cfg(feature = "nitro")]
    return Ok(ne::kms_decrypt(kms_creds, ciphertext).await?);

    #[cfg(feature = "simulate")]
    return Ok(simulated::kms_decrypt(kms_creds, ciphertext).await?);

    unimplemented!()
}
