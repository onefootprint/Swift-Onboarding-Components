use crate::config::Config;
use crate::errors::enclave::EnclaveError;
use crate::errors::ApiResult;
use crate::errors::AssertionError;
use crate::proxy::to_data_transforms;
use crate::s3::S3Client;
use crate::ApiError;
use async_trait::async_trait;
use crypto::aead::AeadSealedBytes;
use crypto::aead::SealingKey;
use crypto::hex;
use crypto::seal::EciesP256Sha256AesGcmSealed;
use enclave_proxy::http_proxy::client::ProxyHttpClient;
use enclave_proxy::DataTransform;
use enclave_proxy::DecryptRequest;
use enclave_proxy::DecryptThenSignRequest;
use enclave_proxy::Decryption;
use enclave_proxy::EnclavePayload;
use enclave_proxy::EnvelopeDecryptRequest;
use enclave_proxy::EnvelopeDecryptThenHmacSignRequest;
use enclave_proxy::EnvelopeHmacSignRequest;
use enclave_proxy::GenerateDataKeypairRequest;
use enclave_proxy::GenerateSymmetricDataKeyRequest;
use enclave_proxy::GeneratedDataKeyPair;
use enclave_proxy::GeneratedSealedDataKey;
use enclave_proxy::HmacSignature;
use enclave_proxy::KmsCredentials;
use enclave_proxy::RpcPayload;
use enclave_proxy::RpcRequest;
use enclave_proxy::SealedIkek;
use enclave_proxy::Sealing;
use enclave_proxy::SignRequest;
use enclave_proxy::Signing;
use futures::TryFutureExt;
use itertools::Itertools;
use newtypes::fingerprint_salt::FingerprintSalt;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::FilterFunction;
use newtypes::Fingerprint;
use newtypes::PiiBytes;
use newtypes::PiiString;
use newtypes::S3Url;
use newtypes::SealedVaultBytes;
use newtypes::SealedVaultDataKey;
use newtypes::VaultPublicKey;
use std::collections::HashMap;
use std::hash::Hash;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct EnclaveClient {
    client: Arc<dyn EnclaveClientProxy>,
    sealed_enc_ikek: SealedIkek<Sealing>,
    sealed_hmac_ikek: SealedIkek<Signing>,
    kms_creds: KmsCredentials,
    /// an s3 client is initialized soley for fetching and decrypting
    /// large objects that are stored in s3
    s3_client: Arc<dyn S3Client>,
}

#[async_trait]
pub trait EnclaveClientProxy: Sync + Send + std::fmt::Debug + 'static {
    async fn send_rpc_request(&self, request: RpcRequest) -> Result<EnclavePayload, EnclaveError>;
}

pub struct DecryptReq<'a>(
    pub &'a EncryptedVaultPrivateKey,
    pub &'a SealedVaultBytes,
    pub Vec<FilterFunction>,
);

pub type VaultKeyPair = (VaultPublicKey, EncryptedVaultPrivateKey);

#[async_trait]
impl EnclaveClientProxy for ProxyHttpClient {
    async fn send_rpc_request(&self, request: RpcRequest) -> Result<EnclavePayload, EnclaveError> {
        Ok(self.send_request(request).await?)
    }
}

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

        let shared_config = aws_config::defaults(aws_config::BehaviorVersion::v2023_11_09())
            .load()
            .await;
        let s3_client = crate::s3::AwsS3Client {
            client: aws_sdk_s3::Client::new(&shared_config),
        };

        Self {
            client: Arc::new(client),
            sealed_enc_ikek: SealedIkek::<Sealing>::new(sealed_enc_ikek),
            sealed_hmac_ikek: SealedIkek::<Signing>::new(sealed_hmac_ikek),
            kms_creds,
            s3_client: Arc::new(s3_client),
        }
    }

    #[cfg(test)]
    pub fn replace_proxy_client(&mut self, client: Arc<dyn EnclaveClientProxy>) {
        self.client = client;
    }

    #[cfg(test)]
    pub fn replace_s3_client(&mut self, client: Arc<dyn S3Client>) {
        self.s3_client = client;
    }

    /// send the request to the enclave
    #[tracing::instrument("EnclaveClient::send", skip_all)]
    async fn send(&self, req: RpcRequest) -> Result<EnclavePayload, EnclaveError> {
        let response = self.client.send_rpc_request(req).await?;
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

    /// Decrypts the provided SealedVaultBytes into PiiString
    pub async fn decrypt_to_piistring(
        &self,
        e_data: &SealedVaultBytes,
        e_key: &EncryptedVaultPrivateKey,
    ) -> Result<PiiString, EnclaveError> {
        let data = HashMap::from_iter([((), DecryptReq(e_key, e_data, vec![]))]);
        let result = self
            .batch_decrypt_to_piistring(data)
            .await?
            .into_iter()
            .next()
            .ok_or(EnclaveError::InvalidEnclaveDecryptResponse)?;
        Ok(result.1)
    }

    /// Decrypts the provided list of SealedVaultBytes into PiiStrings
    pub async fn batch_decrypt_to_piistring<'a, T: Eq + Hash>(
        &self,
        data: HashMap<T, DecryptReq<'a>>,
    ) -> Result<HashMap<T, PiiString>, EnclaveError> {
        let (ids, sealed_data): (Vec<_>, Vec<_>) = data.into_iter().unzip();
        let requests: Vec<_> = sealed_data
            .into_iter()
            .map(|DecryptReq(e_key, e_data, transform)| Ok((e_key, e_data, to_data_transforms(&transform))))
            .collect::<Result<_, crypto::Error>>()?;
        let results = self
            .batch_decrypt_to_piibytes(requests)
            .await?
            .into_iter()
            .map(PiiString::try_from)
            .collect::<Result<Vec<_>, _>>()?;
        let results = ids.into_iter().zip(results.into_iter()).collect();
        Ok(results)
    }

    /// Decrypts the provided SealedVaultBytes into PiiBytes
    pub async fn decrypt_to_pii_bytes(
        &self,
        e_data: &SealedVaultBytes,
        e_key: &EncryptedVaultPrivateKey,
    ) -> Result<PiiBytes, EnclaveError> {
        self.batch_decrypt_to_piibytes(vec![(e_key, e_data, vec![])])
            .await?
            .into_iter()
            .next()
            .ok_or(EnclaveError::InvalidEnclaveDecryptResponse)
    }

    /// Util for batch decrypting many EciesP256Sha256AesGcmSealed values with the same key and
    /// transform into PiiBytes
    #[tracing::instrument(skip_all)]
    pub async fn batch_decrypt_to_piibytes(
        &self,
        sealed_data: Vec<(&EncryptedVaultPrivateKey, &SealedVaultBytes, Vec<DataTransform>)>,
    ) -> Result<Vec<PiiBytes>, EnclaveError> {
        if sealed_data.is_empty() {
            return Ok(vec![]);
        }
        let requests = sealed_data
            .into_iter()
            .map(|(e_key, e_data, transforms)| {
                Ok(DecryptRequest {
                    sealed_data: EciesP256Sha256AesGcmSealed::from_bytes(e_data.as_ref())?,
                    sealed_key: crypto::aead::AeadSealedBytes(e_key.0.clone()),
                    transforms,
                })
            })
            .collect::<Result<Vec<_>, EnclaveError>>()?;
        let num_requests = requests.len();
        let req = enclave_proxy::RpcRequest::new(RpcPayload::Decrypt(EnvelopeDecryptRequest {
            kms_creds: self.kms_creds.clone(),
            sealed_ikek: self.sealed_enc_ikek.clone(),
            requests,
        }));

        let response = self.send(req).await?;
        let response = Decryption::try_from(response)?;
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

    pub async fn compute_fingerprints_keys<T>(
        &self,
        data: Vec<(T, (FingerprintSalt, &PiiString))>,
    ) -> ApiResult<Vec<(T, Fingerprint)>> {
        // Zip the keys of type T back together with the fingerprinted results, since we know
        // that the order of the results from the enclave will match the order of the input data
        let (keys, values_to_fp): (Vec<_>, Vec<_>) = data.into_iter().unzip();
        let fps = self.batch_fingerprint(values_to_fp).await?;
        let fps = fps.into_iter().map(|(_, fp)| fp);
        let results = keys.into_iter().zip(fps).collect();
        Ok(results)
    }

    /// Requests the enclave to fingerprint
    pub async fn batch_fingerprint(
        &self,
        data: Vec<(FingerprintSalt, &PiiString)>,
    ) -> Result<Vec<(FingerprintSalt, Fingerprint)>, EnclaveError> {
        if data.is_empty() {
            return Ok(vec![]);
        }

        // we hash the data once simply to shorten the payload length we send to the enclave
        // and build our list of request to send for fingerprinting in the enclave
        let scopes = data.iter().map(|(s, _)| s.clone()).collect_vec();
        let requests = data
            .iter()
            .map(|(salt, pii)| SignRequest {
                scope: salt.salt_bytes(),
                data: crypto::clean_and_hash_data_for_fingerprinting(pii.leak().as_bytes()).to_vec(),
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

        let results = response.results.into_iter().map(|r| Fingerprint(r.signature));
        let results = scopes.into_iter().zip(results).collect();

        Ok(results)
    }

    /// Requests the enclave to fingerprint sealed data (which it decrypts first)
    pub async fn batch_fingerprint_sealed<T>(
        &self,
        sealed_key: &EncryptedVaultPrivateKey,
        sealed_data: Vec<(T, (FingerprintSalt, &SealedVaultBytes))>,
    ) -> Result<Vec<(T, Fingerprint)>, EnclaveError> {
        if sealed_data.is_empty() {
            return Ok(vec![]);
        }

        let (keys, sealed_data): (Vec<_>, Vec<_>) = sealed_data.into_iter().unzip();
        let requests = sealed_data
            .into_iter()
            .map(|(salt, sealed_data)| {
                Ok(DecryptThenSignRequest {
                    scope: salt.salt_bytes(),
                    sealed_data: EciesP256Sha256AesGcmSealed::from_bytes(sealed_data.as_ref())?,
                })
            })
            .collect::<Result<Vec<_>, EnclaveError>>()?;

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

        let results = response.results.into_iter().map(|r| Fingerprint(r.signature));
        let results = keys.into_iter().zip(results).collect();

        Ok(results)
    }

    #[tracing::instrument(skip_all)]
    pub async fn decrypt_document(
        &self,
        e_private_key: &EncryptedVaultPrivateKey,
        e_data_key: &SealedVaultDataKey,
        s3_url: &S3Url,
    ) -> ApiResult<PiiBytes> {
        #[allow(clippy::let_unit_value)]
        let key = ();
        let documents = vec![(key, (e_private_key, e_data_key, s3_url))]
            .into_iter()
            .collect();

        let results = self.batch_decrypt_documents(documents).await?;

        Ok(results.into_values().next().ok_or(AssertionError(
            "missing static key in batch_decrypt_documents result",
        ))?)
    }

    #[tracing::instrument(skip_all)]
    /// Decrypts the each document by decrypting their SealedVaultDataKey from the enclave and using
    /// this to unseal the actual document bytes, downloaded from s3.
    /// NOTE: this does not apply any data transforms
    pub async fn batch_decrypt_documents<T: Eq + Hash>(
        &self,
        documents: HashMap<T, (&EncryptedVaultPrivateKey, &SealedVaultDataKey, &S3Url)>,
    ) -> Result<HashMap<T, PiiBytes>, ApiError> {
        if documents.is_empty() {
            return Ok(HashMap::new());
        }
        let (ids, documents): (Vec<_>, Vec<_>) = documents.into_iter().unzip();
        let (sealed_keys, s3_urls): (Vec<_>, Vec<_>) = documents
            .into_iter()
            // A little hacky - have to convert the SealedVaultDataKey to SealedVaultDataBytes.
            .map(|(e_private_key, e_key, s3_url)| ((e_private_key, SealedVaultBytes(e_key.0.clone())), s3_url))
            .unzip();
        let get_futures = s3_urls.into_iter().map(|s3_url| {
            self.s3_client
                .get_object_from_s3_url(s3_url)
                .map_err(ApiError::from)
        });
        let document_bytes = futures::future::try_join_all(get_futures).await?;

        // Decrypt all the sealing keys
        let sealed_keys = sealed_keys
            .iter()
            .map(|(e_private_key, e_key)| (*e_private_key, e_key, vec![]))
            .collect();
        let decrypted_keys = self
            .batch_decrypt_to_piibytes(sealed_keys)
            .await?
            .into_iter()
            .map(|b| SealingKey::new(b.into_leak()))
            .collect::<Result<Vec<_>, _>>()?;

        let results = document_bytes
            .into_iter()
            .zip(decrypted_keys)
            .map(|(bytes, key)| {
                key.unseal_bytes(AeadSealedBytes(bytes.to_vec()))
                    .map(PiiBytes::new)
            })
            .collect::<Result<Vec<_>, _>>()?;
        let results = ids.into_iter().zip(results.into_iter()).collect();
        Ok(results)
    }
}
