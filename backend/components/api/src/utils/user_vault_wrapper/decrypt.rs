use super::UserVaultWrapper;
use crate::enclave_client::EnclaveClient;
use crate::errors::{ApiError, ApiResult};
use crate::State;
use crypto::aead::SealingKey;
use enclave_proxy::DataTransform;
use newtypes::{
    DataIdentifier, IdentityDataKind, PhoneNumber, PiiString, SealedVaultBytes, SealedVaultDataKey,
};
use std::collections::HashMap;
use std::convert::Into;
use std::hash::Hash;

impl UserVaultWrapper {
    /// Retrieve the e_data for each of the provided DataIdentifiers, if exists
    pub(super) fn get_e_datas<T>(&self, ids: &[T]) -> HashMap<T, &SealedVaultBytes>
    where
        T: Into<DataIdentifier> + Clone + Hash + Eq,
    {
        HashMap::from_iter(ids.iter().filter_map(|di| {
            match Into::<DataIdentifier>::into(di.clone()) {
                DataIdentifier::Custom(k) => self.kv_data().get(&k).map(|kvd| &kvd.e_data),
                DataIdentifier::Id(idk) => self.get_identity_e_field(idk),
                // Decrypt key here
                DataIdentifier::IdDocument(_) => todo!(),
                DataIdentifier::Selfie(_) => todo!(),
                DataIdentifier::Business(_) => todo!(),
            }
            .map(|e_data| (di.clone(), e_data))
        }))
    }

    /// Util to decrypt a list of DataIdentifiers WITHOUT checking permissions or making an access
    /// event.
    ///
    /// Returns a hashmap of identifiers to their decrypted PiiString.
    /// Note: a provided id may not be included as a key in the resulting hashmap if the identifier
    /// doesn't exist in the UVW.
    pub async fn decrypt_unsafe<T>(
        &self,
        enclave_client: &EnclaveClient,
        ids: &[T],
    ) -> ApiResult<HashMap<T, PiiString>>
    where
        T: Into<DataIdentifier> + Clone + Hash + Eq,
    {
        let (ids, e_datas): (Vec<_>, _) = self.get_e_datas(ids).into_iter().unzip();

        let decrypted_results = enclave_client
            .batch_decrypt_to_piistring(e_datas, &self.user_vault.e_private_key, DataTransform::Identity)
            .await?;
        let results: HashMap<_, _> = ids.into_iter().zip(decrypted_results).collect();
        Ok(results)
    }
}

// TODO should we gate these permissions somehow? Make access events in these?
impl UserVaultWrapper {
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

    pub async fn get_decrypted_primary_phone(&self, state: &State) -> Result<PhoneNumber, ApiError> {
        let e164 = self
            .decrypt_unsafe(&state.enclave_client, &[IdentityDataKind::PhoneNumber])
            .await?
            .remove(&IdentityDataKind::PhoneNumber)
            .ok_or(ApiError::NoPhoneNumberForVault)?;
        let phone_number = PhoneNumber::parse(e164)?;
        Ok(phone_number)
    }
}
