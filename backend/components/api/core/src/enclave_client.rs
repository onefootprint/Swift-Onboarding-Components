use crypto::{aead::SealingKey, hex, seal::EciesP256Sha256AesGcmSealed};
use enclave_proxy::{
    http_proxy::client::ProxyHttpClient, DataTransform, DecryptRequest, DecryptThenSignRequest,
    EnclavePayload, EnvelopeDecryptRequest, EnvelopeDecryptThenHmacSignRequest, EnvelopeHmacSignRequest,
    FnDecryption, GenerateDataKeypairRequest, GenerateSymmetricDataKeyRequest, GeneratedDataKeyPair,
    GeneratedSealedDataKey, HmacSignature, KmsCredentials, RpcPayload, RpcRequest, SealedIkek, Sealing,
    SignRequest, Signing,
};
use itertools::Itertools;
use newtypes::{
    fingerprinter::FingerprintScopable, EncryptedVaultPrivateKey, Fingerprint, PiiBytes, PiiString,
    SealedVaultBytes, SealedVaultDataKey, VaultPublicKey,
};

use crate::{config::Config, errors::enclave::EnclaveError};

#[derive(Debug, Clone)]
pub struct EnclaveClient {
    client: ProxyHttpClient,
    sealed_enc_ikek: SealedIkek<Sealing>,
    sealed_hmac_ikek: SealedIkek<Signing>,
    kms_creds: KmsCredentials,
}

pub type VaultKeyPair = (VaultPublicKey, EncryptedVaultPrivateKey);

impl EnclaveClient {
    #[allow(clippy::expect_used)]
    /// initialize a new enclave client with a pool of connections
    pub async fn new(config: Config) -> Self {
        let sealed_enc_ikek = hex::decode(&config.enclave_config.enclave_sealed_enc_ikek_hex)
            .expect("invalid sealed ENC IKEK hex bytes");

        let sealed_hmac_ikek = hex::decode(&config.enclave_config.enclave_sealed_hmac_ikek_hex)
            .expect("invalid sealed ENC IKEK hex bytes");

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
            sealed_enc_ikek: SealedIkek::<Sealing>::new(sealed_enc_ikek),
            sealed_hmac_ikek: SealedIkek::<Signing>::new(sealed_hmac_ikek),
            kms_creds,
        }
    }

    /// send the request to the enclave
    #[tracing::instrument(skip_all)]
    async fn send(&self, req: RpcRequest) -> Result<EnclavePayload, EnclaveError> {
        tracing::debug!("sending enclave request");
        let response = self.client.send_request(req).await?;
        tracing::debug!("got enclave response");

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
    #[tracing::instrument(skip_all)]
    pub async fn generate_sealed_keypair(&self) -> Result<VaultKeyPair, EnclaveError> {
        let req =
            enclave_proxy::RpcRequest::new(RpcPayload::GenerateDataKeypair(GenerateDataKeypairRequest {
                kms_creds: self.kms_creds.clone(),
                sealed_ikek: self.sealed_enc_ikek.clone(),
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

    /// Decryptes the provided list of SealedVaultDataKeys into SealingKeys
    #[tracing::instrument(skip_all)]
    pub async fn decrypt_sealed_vault_data_key(
        &self,
        sealed_data_keys: &[SealedVaultDataKey],
        sealed_key: &EncryptedVaultPrivateKey,
    ) -> Result<Vec<SealingKey>, EnclaveError> {
        let sealed_data = sealed_data_keys
            .iter()
            .map(|key| EciesP256Sha256AesGcmSealed::from_bytes(&key.0))
            .collect::<Result<_, _>>()?;
        let decrypted_keys = self
            .batch_decrypt_to_piibytes(sealed_data, sealed_key, DataTransform::Identity)
            .await?;
        let response = decrypted_keys
            .into_iter()
            .map(|b| SealingKey::new(b.into_leak()))
            .collect::<Result<Vec<_>, _>>()?;
        Ok(response)
    }

    /// Decrypts the provided SealedVaultBytes into PiiString
    pub async fn decrypt_to_piistring(
        &self,
        sealed_data: &SealedVaultBytes,
        sealed_key: &EncryptedVaultPrivateKey,
        transform: DataTransform,
    ) -> Result<PiiString, EnclaveError> {
        self.batch_decrypt_to_piistring(vec![sealed_data], sealed_key, transform)
            .await?
            .into_iter()
            .next()
            .ok_or(EnclaveError::InvalidEnclaveDecryptResponse)
    }

    /// Decrypts the provided list of SealedVaultBytes into PiiStrings
    pub async fn batch_decrypt_to_piistring(
        &self,
        sealed_data: Vec<&SealedVaultBytes>,
        sealed_key: &EncryptedVaultPrivateKey,
        transform: DataTransform,
    ) -> Result<Vec<PiiString>, EnclaveError> {
        let sealed_data: Vec<_> = sealed_data
            .iter()
            .map(|b| EciesP256Sha256AesGcmSealed::from_bytes(b.as_ref()))
            .collect::<Result<_, _>>()?;
        let results = self
            .batch_decrypt_to_piibytes(sealed_data, sealed_key, transform)
            .await?
            .into_iter()
            .map(PiiString::try_from)
            .collect::<Result<_, _>>()?;
        Ok(results)
    }

    /// Decrypts the provided SealedVaultBytes into PiiBytes
    pub async fn decrypt_to_pii_bytes(
        &self,
        sealed_data: &SealedVaultBytes,
        sealed_key: &EncryptedVaultPrivateKey,
        transform: DataTransform,
    ) -> Result<PiiBytes, EnclaveError> {
        let sealed = EciesP256Sha256AesGcmSealed::from_bytes(sealed_data.as_ref())?;
        self.batch_decrypt_to_piibytes(vec![sealed], sealed_key, transform)
            .await?
            .into_iter()
            .next()
            .ok_or(EnclaveError::InvalidEnclaveDecryptResponse)
    }

    /// Util for batch decrypting many EciesP256Sha256AesGcmSealed values with the same key and transform
    /// into PiiBytes
    #[tracing::instrument(skip_all)]
    pub async fn batch_decrypt_to_piibytes(
        &self,
        sealed_data: Vec<EciesP256Sha256AesGcmSealed>,
        sealed_key: &EncryptedVaultPrivateKey,
        transform: DataTransform,
    ) -> Result<Vec<PiiBytes>, EnclaveError> {
        let requests = sealed_data
            .into_iter()
            .map(|sealed_data| DecryptRequest {
                sealed_data,
                transform,
            })
            .collect_vec();
        let num_requests = requests.len();
        let req = enclave_proxy::RpcRequest::new(RpcPayload::FnDecrypt(EnvelopeDecryptRequest {
            kms_creds: self.kms_creds.clone(),
            sealed_ikek: self.sealed_enc_ikek.clone(),
            sealed_key: crypto::aead::AeadSealedBytes(sealed_key.0.clone()),
            requests,
        }));

        let response = self.send(req).await?;
        let response = FnDecryption::try_from(response)?;
        if response.results.len() != num_requests {
            return Err(EnclaveError::InvalidEnclaveDecryptResponse);
        }

        let results = response
            .results
            .into_iter()
            .map(|r| PiiBytes::new(r.data))
            .collect();
        Ok(results)
    }

    /// Requests the enclave to fingerprint
    pub async fn batch_fingerprint<S: FingerprintScopable + Send + Sync>(
        &self,
        data: &[(S, &PiiString)],
    ) -> Result<Vec<Fingerprint>, EnclaveError> {
        // we hash the data once simply to shorten the payload length we send to the enclave
        // and build our list of request to send for fingerprinting in the enclave
        let requests = data
            .iter()
            .map(|(di, pii)| {
                (
                    di,
                    crypto::clean_and_hash_data_for_fingerprinting(pii.leak().as_bytes()),
                )
            })
            .map(|(di, data)| SignRequest {
                scope: di.scope().bytes(),
                data: data.to_vec(),
            })
            .collect_vec();

        let num_requests = requests.len();

        // envelope the requests
        let req = enclave_proxy::RpcRequest::new(RpcPayload::HmacSign(EnvelopeHmacSignRequest {
            kms_creds: self.kms_creds.clone(),
            sealed_ikek: self.sealed_hmac_ikek.clone(),
            requests,
        }));

        let response = self.send(req).await?;
        let response = HmacSignature::try_from(response)?;
        if response.results.len() != num_requests {
            return Err(EnclaveError::InvalidEnclaveFingerprintResponse);
        }

        let results = response
            .results
            .into_iter()
            .map(|r| Fingerprint(r.signature))
            .collect();

        Ok(results)
    }

    /// Requests the enclave to fingerprint sealed data (which it decrypts first)
    pub async fn batch_fingerprint_sealed<S: FingerprintScopable + Send + Sync>(
        &self,
        sealed_key: &EncryptedVaultPrivateKey,
        sealed_data: Vec<(S, EciesP256Sha256AesGcmSealed)>,
    ) -> Result<Vec<Fingerprint>, EnclaveError> {
        let requests = sealed_data
            .into_iter()
            .map(|(di, sealed_data)| DecryptThenSignRequest {
                scope: di.scope().bytes(),
                sealed_data,
            })
            .collect_vec();

        let num_requests = requests.len();

        // envelope the requests
        let req = enclave_proxy::RpcRequest::new(RpcPayload::DecryptThenHmacSign(
            EnvelopeDecryptThenHmacSignRequest {
                kms_creds: self.kms_creds.clone(),
                sealing_ikek: self.sealed_enc_ikek.clone(),
                signing_ikek: self.sealed_hmac_ikek.clone(),
                requests,
                sealed_key: crypto::aead::AeadSealedBytes(sealed_key.0.clone()),
            },
        ));

        let response = self.send(req).await?;
        let response = HmacSignature::try_from(response)?;
        if response.results.len() != num_requests {
            return Err(EnclaveError::InvalidEnclaveFingerprintResponse);
        }

        let results = response
            .results
            .into_iter()
            .map(|r| Fingerprint(r.signature))
            .collect();

        Ok(results)
    }
}
