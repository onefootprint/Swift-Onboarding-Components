use crypto::{aead::ScopedSealingKey, hex, seal::EciesP256Sha256AesGcmSealed};
use enclave_proxy::{
    http_proxy::client::ProxyHttpClient, DataTransform, DecryptRequest, EnclavePayload,
    EnvelopeDecryptRequest, FnDecryption, GenerateDataKeypairRequest, GenerateSymmetricDataKeyRequest,
    GeneratedDataKeyPair, GeneratedSealedDataKey, KmsCredentials, RpcPayload, RpcRequest, SealedIkek,
};
use newtypes::{EncryptedVaultPrivateKey, PiiString, SealedVaultBytes, SealedVaultDataKey, VaultPublicKey};

use crate::{config::Config, errors::enclave::EnclaveError};

#[derive(Debug, Clone)]
pub struct EnclaveClient {
    client: ProxyHttpClient,
    sealed_ikek: SealedIkek,
    kms_creds: KmsCredentials,
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

        let client = ProxyHttpClient::new(
            &config.enclave_config.enclave_proxy_endpoint,
            &config.enclave_config.enclave_proxy_secret,
        )
        .expect("failed to build enclave http proxy client");

        Self {
            client,
            sealed_ikek: SealedIkek(sealed_ikek),
            kms_creds,
        }
    }

    /// send the request to the enclave
    async fn send(&self, req: RpcRequest) -> Result<EnclavePayload, EnclaveError> {
        tracing::info!("sending enclave request");
        let response = self.client.send_request(req).await?;
        tracing::info!("got enclave response");

        Ok(response)
    }

    /// play ping-pong
    #[allow(dead_code)]
    pub async fn pong(&self) -> Result<String, EnclaveError> {
        let req = enclave_proxy::RpcRequest::new(RpcPayload::Ping("test".into()));
        let response = self.send(req).await?;

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
        let req =
            enclave_proxy::RpcRequest::new(RpcPayload::GenerateDataKeypair(GenerateDataKeypairRequest {
                kms_creds: self.kms_creds.clone(),
                sealed_ikek: self.sealed_ikek.clone(),
            }));

        let response = self.send(req).await?;

        let response = GeneratedDataKeyPair::try_from(response)?;

        let public_key = VaultPublicKey::from_raw_uncompressed(&response.sealed_key_pair.public_key_bytes)?;

        let encrypted_private_key = EncryptedVaultPrivateKey(response.sealed_key_pair.sealed_private_key.0);

        Ok((public_key, encrypted_private_key))
    }

    /// generates a new sealed data key with the plaintext key
    #[allow(unused)]
    pub async fn generated_sealed_data_key(
        &self,
        vault_public_key: &VaultPublicKey,
    ) -> Result<SealedVaultDataKey, EnclaveError> {
        let req = enclave_proxy::RpcRequest::new(RpcPayload::GenerateSymmetricDataKey(
            GenerateSymmetricDataKeyRequest {
                public_key_bytes: vault_public_key.as_ref().to_vec(),
            },
        ));

        let response = self.send(req).await?;
        let response = GeneratedSealedDataKey::try_from(response)?;

        let encrypted_data_key = SealedVaultDataKey::try_from(response.sealed_key.sealed_key)?;

        Ok(encrypted_data_key)
    }

    /// generates a new sealed data key with the plaintext key
    pub async fn decrypt_sealed_vault_data_key(
        &self,
        sealed_data_keys: &[SealedVaultDataKey],
        sealed_key: &EncryptedVaultPrivateKey,
        scope: &'static str,
    ) -> Result<Vec<ScopedSealingKey>, EnclaveError> {
        let requests = sealed_data_keys
            .iter()
            .map(|k| -> Result<DecryptRequest, EnclaveError> {
                Ok(DecryptRequest {
                    sealed_data: EciesP256Sha256AesGcmSealed::from_bytes(&k.0)?,
                    transform: DataTransform::Identity,
                })
            })
            .collect::<Result<Vec<_>, _>>()?;

        let req = enclave_proxy::RpcRequest::new(RpcPayload::FnDecrypt(EnvelopeDecryptRequest {
            kms_creds: self.kms_creds.clone(),
            sealed_ikek: self.sealed_ikek.clone(),
            sealed_key: crypto::aead::AeadSealedBytes(sealed_key.0.clone()),
            requests,
        }));

        let response = self.send(req).await?;

        let response = FnDecryption::try_from(response)?;
        let response = response
            .results
            .into_iter()
            .map(|r| -> Result<ScopedSealingKey, crypto::Error> {
                let k = ScopedSealingKey::new(r.data, scope)?;
                Ok(k)
            })
            .collect::<Result<Vec<_>, _>>()
            .map_err(|_| EnclaveError::InvalidEnclaveDecryptResponse)?;

        Ok(response)
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
        let req = enclave_proxy::RpcRequest::new(RpcPayload::FnDecrypt(EnvelopeDecryptRequest {
            kms_creds: self.kms_creds.clone(),
            sealed_ikek: self.sealed_ikek.clone(),
            sealed_key: crypto::aead::AeadSealedBytes(sealed_key.0.clone()),
            requests: requests.clone(),
        }));

        let response = self.send(req).await?;

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
