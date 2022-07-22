use crate::errors::kms::KmsSignError;
use crate::errors::{enclave::EnclaveError, ApiError};
use crate::State;

use aws_sdk_kms::model::DataKeyPairSpec;
use crypto::seal::EciesP256Sha256AesGcmSealed;
use enclave_proxy::{
    DataTransform, DecryptRequest, EnvelopeDecrypt, FnDecryption, KmsCredentials, RpcPayload,
};
use newtypes::{EncryptedVaultPrivateKey, PiiString, SealedVaultBytes, VaultPublicKey};

pub async fn gen_keypair(state: &State) -> Result<(VaultPublicKey, EncryptedVaultPrivateKey), KmsSignError> {
    let new_key_pair = state
        .kms_client
        .generate_data_key_pair_without_plaintext()
        .key_id(&state.config.enclave_root_key_id)
        .key_pair_spec(DataKeyPairSpec::EccNistP256)
        .send()
        .await?;

    let vault_public_key = VaultPublicKey::from_der_bytes(&new_key_pair.public_key.unwrap().into_inner())?;
    let encrypted_vault_private_key =
        EncryptedVaultPrivateKey(new_key_pair.private_key_ciphertext_blob.unwrap().into_inner());

    Ok((vault_public_key, encrypted_vault_private_key))
}

pub async fn decrypt_bytes(
    state: &actix_web::web::Data<State>,
    sealed_data: &SealedVaultBytes,
    sealed_key: &EncryptedVaultPrivateKey,
    transform: DataTransform,
) -> Result<PiiString, ApiError> {
    let sealed_data = EciesP256Sha256AesGcmSealed::from_bytes(sealed_data.as_ref())?;
    let requests = vec![DecryptRequest {
        sealed_data,
        transform,
    }];
    let results = decrypt(state, requests, sealed_key).await?;
    results
        .into_iter()
        .next()
        .ok_or_else(|| EnclaveError::InvalidEnclaveDecryptResponse.into())
}

pub async fn decrypt(
    state: &actix_web::web::Data<State>,
    requests: Vec<DecryptRequest>,
    sealed_key: &EncryptedVaultPrivateKey,
) -> Result<Vec<PiiString>, EnclaveError> {
    let mut conn = state.enclave_connection_pool.get().await?;

    let req = enclave_proxy::RpcRequest::new(RpcPayload::FnDecrypt(EnvelopeDecrypt {
        kms_creds: KmsCredentials {
            key_id: state.config.enclave_aws_access_key_id.clone(),
            region: state.config.aws_region.clone(),
            secret_key: state.config.enclave_aws_secret_access_key.clone(),
            session_token: None,
        },
        sealed_key: sealed_key.0.clone(),
        requests: requests.clone(),
    }));
    tracing::info!("sending request");
    let response = enclave_proxy::send_rpc_request(&req, &mut conn).await?;
    tracing::info!("got response");
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
