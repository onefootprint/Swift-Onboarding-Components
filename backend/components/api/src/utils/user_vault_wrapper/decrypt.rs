use super::UserVaultWrapper;
use crate::errors::{ApiError, ApiResult};
use crate::State;
use crypto::aead::SealingKey;
use enclave_proxy::DataTransform;
use newtypes::{DataIdentifier, PiiString, SealedVaultDataKey, ValidatedPhoneNumber};
use paperclip::actix::Apiv2Schema;
use std::collections::HashMap;
use std::convert::Into;
use std::hash::Hash;

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    pub reason: String,
}

impl UserVaultWrapper {
    /// Util to decrypt a list of T where T represents a DataIdentifier. Returns a hashmap of T to
    /// the decrypted PiiString.
    /// Note: a provided id may not be included as a key in the resulting hashmap if the identifier
    /// doesn't have any associated data on the UVW.
    pub async fn decrypt<T>(&self, state: &State, ids: &[T]) -> ApiResult<HashMap<T, PiiString>>
    where
        T: Into<DataIdentifier> + Clone + Hash + Eq,
    {
        let (ids, e_datas): (Vec<_>, Vec<_>) = ids
            .iter()
            .filter_map(|di| {
                match Into::<DataIdentifier>::into(di.clone()) {
                    DataIdentifier::Custom(k) => self.kv_data().get(&k).map(|kvd| &kvd.e_data),
                    DataIdentifier::Identity(idk) => self.get_identity_e_field(idk),
                    // Decrypt key here
                    DataIdentifier::IdentityDocument => todo!(),
                }
                .map(|e_data| (di.clone(), e_data))
            })
            .unzip();

        let decrypted_results = state
            .enclave_client
            .decrypt_bytes_batch(e_datas, &self.user_vault.e_private_key, DataTransform::Identity)
            .await?;
        let results: HashMap<_, _> = ids.into_iter().zip(decrypted_results).collect();
        // TODO create access event, sometimes
        Ok(results)
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

    pub async fn get_decrypted_primary_phone(&self, state: &State) -> Result<ValidatedPhoneNumber, ApiError> {
        let number = self
            .phone_numbers()
            .iter()
            .next()
            .ok_or(ApiError::NoPhoneNumberForVault)?;

        let e_datas = vec![&number.e_e164, &number.e_country];
        // TODO get rid of this bespoke decryption code. We need it right now because this function
        // returns a ValidatedPhoneNumber, which contains the decrypted PhoneNumber.e_country.
        // I don't think any codepaths that use this really need the e_country, so we can refactor
        // this to not return a ValidatedPhoneNumber
        let decrypt_response = state
            .enclave_client
            .decrypt_bytes_batch(e_datas, &self.user_vault.e_private_key, DataTransform::Identity)
            .await?;
        let e164 = decrypt_response.get(0).ok_or(ApiError::NotImplemented)?.clone();
        let country = decrypt_response.get(1).ok_or(ApiError::NotImplemented)?.clone();

        let validated_phone_number = ValidatedPhoneNumber::__build_from_vault(e164, country)?;
        Ok(validated_phone_number)
    }
}
