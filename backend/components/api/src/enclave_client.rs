use crypto::{hex, seal::EciesP256Sha256AesGcmSealed};
use enclave_proxy::{
    bb8::{self, ErrorSink},
    pool, DataTransform, DecryptRequest, EnclavePayload, EnvelopeDecryptRequest, FnDecryption,
    GenerateDataKeypairRequest, GeneratedDataKeyPair, KmsCredentials, RpcPayload, SealedIkek, StreamManager,
};
use newtypes::{EncryptedVaultPrivateKey, PiiString, SealedVaultBytes, VaultPublicKey};

use crate::{
    config::{Config, EnclaveConfig},
    errors::enclave::EnclaveError,
};

#[derive(Debug, Clone)]
pub struct EnclaveClient {
    pool: bb8::Pool<pool::StreamManager<StreamManager<EnclaveConfig>>>,
    sealed_ikek: SealedIkek,
    kms_creds: KmsCredentials,
}

/// Record errors that occur from enclave pool connections
#[derive(Debug, Clone)]
struct EnclavePoolErrorSink;
impl ErrorSink<enclave_proxy::Error> for EnclavePoolErrorSink {
    fn sink(&self, error: enclave_proxy::Error) {
        tracing::error!(target: "enclave_pool_error", error=?error, "enclave connection pool error");
    }

    fn boxed_clone(&self) -> Box<(dyn ErrorSink<enclave_proxy::Error> + 'static)> {
        Box::new(self.clone())
    }
}

impl EnclaveClient {
    /// initialize a new enclave client with a pool of connections
    pub async fn new(config: Config) -> Self {
        let sealed_ikek = hex::decode(&config.enclave_config.enclave_sealed_ikek_hex)
            .expect("invalid sealed IKEK hex bytes");

        let kms_creds = KmsCredentials {
            key_id: config.enclave_config.enclave_aws_access_key_id.clone(),
            region: config.aws_region.clone(),
            secret_key: config.enclave_config.enclave_aws_secret_access_key.clone(),
            session_token: None,
        };

        let manager = StreamManager {
            config: config.enclave_config,
        };
        let pool = bb8::Pool::builder()
            .min_idle(Some(3))
            .max_size(50)
            .connection_timeout(std::time::Duration::from_secs(4))
            .test_on_check_out(false)
            .error_sink(Box::new(EnclavePoolErrorSink))
            .build(pool::StreamManager(manager))
            .await
            .expect("could not create enclave conn pool");

        Self {
            pool,
            sealed_ikek: SealedIkek(sealed_ikek),
            kms_creds,
        }
    }

    /// play ping-pong
    pub async fn pong(&self) -> Result<String, EnclaveError> {
        let mut conn = self.pool.get().await?;
        let req = enclave_proxy::RpcRequest::new(RpcPayload::Ping("test".into()));

        tracing::info!("sending request");
        let response = enclave_proxy::send_rpc_request(&req, &mut conn).await?;

        if let EnclavePayload::Pong(response) = response {
            Ok(response)
        } else {
            Ok("invalid enclave response".to_string())
        }
    }

    /// generates a new sealed vault key pair via the enclave
    pub async fn generate_sealed_keypair(
        &self,
    ) -> Result<(VaultPublicKey, EncryptedVaultPrivateKey), EnclaveError> {
        let mut conn = self.pool.get().await?;

        let req =
            enclave_proxy::RpcRequest::new(RpcPayload::GenerateDataKeypair(GenerateDataKeypairRequest {
                kms_creds: self.kms_creds.clone(),
                sealed_ikek: self.sealed_ikek.clone(),
            }));

        tracing::info!("sending enclave request");
        let response = enclave_proxy::send_rpc_request(&req, &mut conn).await?;
        tracing::info!("got enclave response");

        let response = GeneratedDataKeyPair::try_from(response)?;

        let public_key = VaultPublicKey::from_raw_uncompressed(&response.sealed_key_pair.public_key_bytes)?;

        let encrypted_private_key = EncryptedVaultPrivateKey(response.sealed_key_pair.sealed_private_key.0);

        Ok((public_key, encrypted_private_key))
    }

    pub async fn decrypt_bytes(
        &self,
        sealed_data: &SealedVaultBytes,
        sealed_key: &EncryptedVaultPrivateKey,
        transform: DataTransform,
    ) -> Result<PiiString, EnclaveError> {
        self.decrypt_bytes_batch(vec![sealed_data], sealed_key, transform)
            .await?
            .into_iter()
            .next()
            .ok_or(EnclaveError::InvalidEnclaveDecryptResponse)
    }

    pub async fn decrypt_bytes_batch(
        &self,
        sealed_data: Vec<&SealedVaultBytes>,
        sealed_key: &EncryptedVaultPrivateKey,
        transform: DataTransform,
    ) -> Result<Vec<PiiString>, EnclaveError> {
        let requests = sealed_data
            .into_iter()
            .map(|d| {
                Ok(DecryptRequest {
                    sealed_data: EciesP256Sha256AesGcmSealed::from_bytes(d.as_ref())?,
                    transform,
                })
            })
            .collect::<Result<Vec<DecryptRequest>, crypto::Error>>()?;
        let results = self.decrypt(requests, sealed_key).await?;
        Ok(results)
    }

    pub async fn decrypt(
        &self,
        requests: Vec<DecryptRequest>,
        sealed_key: &EncryptedVaultPrivateKey,
    ) -> Result<Vec<PiiString>, EnclaveError> {
        let mut conn = self.pool.get().await?;

        let req = enclave_proxy::RpcRequest::new(RpcPayload::FnDecrypt(EnvelopeDecryptRequest {
            kms_creds: self.kms_creds.clone(),
            sealed_ikek: self.sealed_ikek.clone(),
            sealed_key: crypto::aead::AeadSealedBytes(sealed_key.0.clone()),
            requests: requests.clone(),
        }));

        tracing::info!("sending enclave request");
        let response = enclave_proxy::send_rpc_request(&req, &mut conn).await?;
        tracing::info!("got enclave response");

        let response = FnDecryption::try_from(response)?;
        let decrypted_results = response
            .results
            .into_iter()
            .map(|r| Ok(std::str::from_utf8(&r.data)?.to_string()))
            .map(|x| x.map(PiiString::from))
            .collect::<Result<Vec<PiiString>, EnclaveError>>()?;

        if decrypted_results.len() != requests.len() {
            return Err(EnclaveError::InvalidEnclaveDecryptResponse);
        }

        Ok(decrypted_results)
    }
}
