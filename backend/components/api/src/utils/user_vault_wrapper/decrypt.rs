use super::UserVaultWrapper;
use crate::errors::{ApiError, ApiResult};
use crate::State;
use crypto::aead::SealingKey;
use enclave_proxy::DataTransform;
use newtypes::{PiiString, SealedVaultBytes, SealedVaultDataKey, ValidatedPhoneNumber};
use paperclip::actix::Apiv2Schema;
use std::convert::Into;

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    pub reason: String,
}

impl UserVaultWrapper {
    // TODO make an access event here too
    // take in identifier (identity, custom, or doc request id)
    pub async fn decrypt(
        &self,
        state: &State,
        data: Vec<&SealedVaultBytes>,
    ) -> Result<Vec<PiiString>, ApiError> {
        let decrypted_results = state
            .enclave_client
            .decrypt_bytes_batch(data, &self.user_vault.e_private_key, DataTransform::Identity)
            .await?;
        Ok(decrypted_results)
    }

    pub async fn decrypt_data_keys(
        &self,
        state: &State,
        keys: Vec<SealedVaultDataKey>,
    ) -> ApiResult<Vec<SealingKey>> {
        let decrypted_results = state
            .enclave_client
            .decrypt_sealed_vault_data_key(&keys, &self.user_vault.e_private_key)
            .await?;

        Ok(decrypted_results)
    }

    // TODO don't want this to make an access event
    pub async fn get_decrypted_primary_phone(&self, state: &State) -> Result<ValidatedPhoneNumber, ApiError> {
        let number = self
            .phone_numbers()
            .iter()
            .next()
            .ok_or(ApiError::NoPhoneNumberForVault)?;

        let decrypt_response = self
            .decrypt(state, vec![&number.e_e164, &number.e_country])
            .await?;
        let e164 = decrypt_response.get(0).ok_or(ApiError::NotImplemented)?.clone();
        let country = decrypt_response.get(1).ok_or(ApiError::NotImplemented)?.clone();

        let validated_phone_number = ValidatedPhoneNumber::__build_from_vault(e164, country)?;
        Ok(validated_phone_number)
    }
}
