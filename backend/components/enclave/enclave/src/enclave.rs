use crypto::aead::ScopedSealingKey;
use crypto::clean_and_hash_data_for_fingerprinting;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use once_cell::sync::Lazy;
use rpc::{
    DataTransformer,
    DataTransforms,
    DecryptThenSignRequest,
    EnvelopeDecryptThenHmacSignRequest,
    EnvelopeHmacSignRequest,
    GenerateDataKeypairRequest,
    GenerateSymmetricDataKeyRequest,
    GeneratedDataKeyPair,
    GeneratedSealedDataKey,
    HmacSignature,
    HmacSignatureSingle,
    SealedIkek,
    SealedIkekId,
    SignRequest,
};
use std::collections::HashMap;
use thiserror::Error;
use tokio::sync::RwLock;

#[cfg(feature = "simulate")]
mod simulated;

#[cfg(feature = "nitro")]
mod ne;

use crate::{
    log_info_t,
    Decryption,
    DecryptionSingle,
    EnvelopeDecryptRequest,
    KmsCredentials,
};

/// init the enclave sdk if needed
pub fn init() {
    #[cfg(feature = "nitro")]
    ne::init();
}

/// cleanup the enclave sdk if needed
pub fn clean_up() {
    #[cfg(feature = "nitro")]
    ne::clean_up();
}

/// on a loop ask NSM to seed entropy for us
#[cfg(feature = "nitro")]
pub fn spawn_seed_entropy_loop() {
    tokio::spawn(async move {
        loop {
            let seed = tokio::task::spawn_blocking(ne::seed_entropy);
            match seed.await {
                Ok(success) => {
                    if success {
                        log_info_t("successfully seeded entropy");
                    } else {
                        log_info_t("error code AWS_OP_ERROR seeding entropy");
                    }
                }
                Err(e) => {
                    log::info!("error seeding entropy: {:?}", e);
                }
            };
            tokio::time::sleep(std::time::Duration::from_secs(5)).await;
        }
    });
}

#[allow(clippy::large_enum_variant)]
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

    #[error("Transform error: {0}")]
    TransformError(#[from] rpc::TransformError),
}

#[cfg(feature = "nitro")]
pub type Client = ne::Client;

#[cfg(feature = "simulate")]
pub type Client = simulated::Client;

#[derive(Clone)]
pub struct Ikek {
    key: ScopedSealingKey,
}

pub type KekCache = HashMap<SealedIkekId, Ikek>;

static GLOBAL_KEK_CACHE: Lazy<RwLock<KekCache>> = Lazy::new(|| RwLock::new(KekCache::new()));

pub async fn load_ikek<P>(kms_creds: KmsCredentials, sealed_ikek: SealedIkek<P>) -> Result<Ikek, Error> {
    log_info_t("in load_key");

    let cache = GLOBAL_KEK_CACHE.read().await;

    let sealed_kek_id = sealed_ikek.id();

    log::info!("sealed_kek_id={:?}", &sealed_kek_id);

    if let Some(ikek) = cache.get(&sealed_kek_id) {
        log_info_t("kek already loaded");
        return Ok(ikek.clone());
    }

    // release the read lock
    std::mem::drop(cache);

    // acquire the write lock
    let mut cache = GLOBAL_KEK_CACHE.write().await;

    // check again if it exists now, and return out
    if let Some(ikek) = cache.get(&sealed_kek_id) {
        log_info_t("kek already loaded (2)");
        return Ok(ikek.clone());
    }

    log_info_t("before load_key kms_decrypt");
    let ikek_key_bytes = kms_decrypt(kms_creds, sealed_ikek.bytes).await?;
    log_info_t("decrypted kek");

    let ikek = Ikek {
        key: crypto::conversion::to_enclave_ikek_sealing_key(ikek_key_bytes)?,
    };

    // cache the ikek
    cache.insert(sealed_kek_id, ikek.clone());

    Ok(ikek)
}

pub async fn handle_generate_data_keypair(
    request: GenerateDataKeypairRequest,
) -> Result<GeneratedDataKeyPair, Error> {
    let GenerateDataKeypairRequest {
        kms_creds,
        sealed_ikek,
    } = request;
    let ikek = load_ikek(kms_creds, sealed_ikek).await?;

    let sealed_key_pair = ikek.key.generate_sealed_random_ecies_p256_key_pair()?;

    Ok(GeneratedDataKeyPair { sealed_key_pair })
}

pub async fn handle_generate_symmetric_data_key(
    request: GenerateSymmetricDataKeyRequest,
) -> Result<GeneratedSealedDataKey, Error> {
    let GenerateSymmetricDataKeyRequest { public_key_bytes } = request;
    let sealed_key =
        SealedChaCha20Poly1305DataKey::generate_sealed_random_chacha20_poly1305_key(&public_key_bytes)?;
    Ok(GeneratedSealedDataKey { sealed_key })
}

pub async fn handle_decrypt(request: EnvelopeDecryptRequest) -> Result<Decryption, Error> {
    let EnvelopeDecryptRequest {
        kms_creds,
        requests,
        sealed_ikek,
    } = request;

    let ikek = load_ikek(kms_creds, sealed_ikek).await?;
    let results: Vec<DecryptionSingle> = requests
        .into_iter()
        .map(|r| {
            let data_private_key = ikek.key.unseal_bytes(r.sealed_key)?;
            let result = crypto::seal::unseal::unseal_ecies_p256_x963_sha256_aes_gcm(
                &data_private_key,
                r.sealed_data.clone(),
            )?;
            let transforms = DataTransforms(r.transforms);
            Ok(DecryptionSingle {
                data: transforms.apply(result.0)?,
            })
        })
        .collect::<Result<Vec<DecryptionSingle>, Error>>()?;

    log_info_t("unsealed ciphertext(s)");

    Ok(Decryption { results })
}

pub async fn handle_hmac_sign(request: EnvelopeHmacSignRequest) -> Result<HmacSignature, Error> {
    let EnvelopeHmacSignRequest {
        kms_creds,
        requests,
        sealed_ikek,
    } = request;

    // load our root signing key
    let ikek = load_ikek(kms_creds, sealed_ikek).await?;
    let root_signing_key_sha256 = ikek.key.sha256();

    // compute the signatures
    let results = requests
        .iter()
        .map(|SignRequest { scope, data }| {
            // our scoped key is H(H(scope) || H(root_signing_key))
            let h = crypto::sha256;
            let scoped_key = h(&[h(scope), root_signing_key_sha256].concat());

            // use the scoped key to sign the data
            let signature = crypto::hmac_sha256_sign(&scoped_key, data)?;

            Ok(HmacSignatureSingle { signature })
        })
        .collect::<Result<Vec<HmacSignatureSingle>, Error>>()?;

    Ok(HmacSignature { results })
}

pub async fn handle_decrypt_then_hmac_sign(
    request: EnvelopeDecryptThenHmacSignRequest,
) -> Result<HmacSignature, Error> {
    let EnvelopeDecryptThenHmacSignRequest {
        kms_creds,
        signing_ikek,
        sealing_ikek,
        requests,
        sealed_key,
    } = request;

    let sealing_ikek = load_ikek(kms_creds.clone(), sealing_ikek).await?;
    let data_private_key = sealing_ikek.key.unseal_bytes(sealed_key)?;

    let signing_ikek = load_ikek(kms_creds, signing_ikek).await?;
    let root_signing_key_sha256 = signing_ikek.key.sha256();

    let results: Vec<HmacSignatureSingle> = requests
        .into_iter()
        .map(|r| {
            let DecryptThenSignRequest { sealed_data, scope } = r;
            // first decrypt the data
            let result =
                crypto::seal::unseal::unseal_ecies_p256_x963_sha256_aes_gcm(&data_private_key, sealed_data)?;

            let data = clean_and_hash_data_for_fingerprinting(&result.0);

            // our scoped key is H(H(scope) || H(root_signing_key))
            let h = crypto::sha256;
            let scoped_key = h(&[h(&scope), root_signing_key_sha256].concat());

            // use the scoped key to sign the data
            let signature = crypto::hmac_sha256_sign(&scoped_key, &data)?;

            Ok(HmacSignatureSingle { signature })
        })
        .collect::<Result<Vec<_>, Error>>()?;

    Ok(HmacSignature { results })
}

/// Main Enclave KMS decrypt function
#[allow(unreachable_code)]
pub async fn kms_decrypt(kms_creds: KmsCredentials, ciphertext: Vec<u8>) -> Result<Vec<u8>, Error> {
    log_info_t("in kms_decrypt");

    let client = Client::new(kms_creds)?;

    log_info_t("created_client");

    #[cfg(feature = "nitro")]
    {
        return Ok(ne::kms_decrypt(client, ciphertext).await?);
    }

    #[cfg(feature = "simulate")]
    {
        return Ok(simulated::kms_decrypt(client, ciphertext).await?);
    }

    unimplemented!("invalid feature gate: must be nitro or simulate")
}
