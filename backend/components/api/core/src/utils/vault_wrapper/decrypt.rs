use super::{Person, VaultWrapper};
use crate::enclave_client::EnclaveClient;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::State;
use crypto::aead::SealingKey;
use enclave_proxy::DataTransform;
use newtypes::{DataIdentifier, IdentityDataKind as IDK, PhoneNumber, PiiString, SealedVaultDataKey};
use std::collections::HashMap;

impl<Type> VaultWrapper<Type> {
    /// Util to decrypt a list of DataIdentifiers WITHOUT checking permissions or making an access
    /// event.
    ///
    /// Returns a hashmap of identifiers to their decrypted PiiString.
    /// Note: a provided id may not be included as a key in the resulting hashmap if the identifier
    /// doesn't exist in the UVW.
    pub async fn decrypt_unchecked(
        &self,
        enclave_client: &EnclaveClient,
        ids: &[DataIdentifier],
    ) -> ApiResult<HashMap<DataIdentifier, PiiString>> {
        if let Some(di) = ids
            .iter()
            .find(|di| matches!(di, DataIdentifier::IdDocument(_) | DataIdentifier::Selfie(_)))
        {
            return Err(UserError::CannotDecrypt(di.clone()).into());
        }

        let data = ids
            .iter()
            .filter_map(|id| self.get_e_data(id.clone()).map(|e_data| (id.clone(), e_data)))
            .collect();

        let results = enclave_client
            .batch_decrypt_to_piistring(data, &self.vault.e_private_key, DataTransform::Identity)
            .await?;
        Ok(results)
    }
}

// TODO should we gate these permissions somehow? Make access events in these?
impl VaultWrapper<Person> {
    pub async fn decrypt_data_keys(
        &self,
        state: &State,
        keys: Vec<SealedVaultDataKey>,
    ) -> ApiResult<Vec<SealingKey>> {
        let decrypted_results = state
            .enclave_client
            .decrypt_sealed_vault_data_key(&keys, &self.vault.e_private_key)
            .await?;

        Ok(decrypted_results)
    }

    pub async fn get_decrypted_primary_phone(&self, state: &State) -> Result<PhoneNumber, ApiError> {
        let e164 = self
            .decrypt_unchecked(&state.enclave_client, &[IDK::PhoneNumber.into()])
            .await?
            .remove(&IDK::PhoneNumber.into())
            .ok_or(ApiError::NoPhoneNumberForVault)?;
        let phone_number = PhoneNumber::parse(e164)?;
        Ok(phone_number)
    }
}
