use super::{Person, VaultWrapper};
use crate::enclave_client::EnclaveClient;
use crate::errors::{ApiError, ApiResult};
use crate::State;
use crypto::aead::SealingKey;
use db::models::document_data::DocumentData;
use db::models::vault_data::VaultedData;
use derive_more::{Deref, DerefMut};
use either::Either;
use enclave_proxy::DataTransform;
use itertools::Itertools;
use newtypes::{
    DataIdentifier, IdentityDataKind as IDK, PhoneNumber, PiiBytes, PiiString, SealedVaultDataKey,
};
use std::collections::HashMap;

#[derive(Deref, DerefMut)]
pub struct DecryptUncheckedResult {
    #[deref]
    #[deref_mut]
    pub results: HashMap<DataIdentifier, PiiString>,
    pub decrypted_dis: Vec<DataIdentifier>,
}

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
    ) -> ApiResult<DecryptUncheckedResult> {
        // Split data identifiers by (document kinds, e_data kinds, p_data kinds)
        let (documents_kinds, remaining_dis): (Vec<_>, Vec<_>) = ids.iter().partition_map(|di| match di {
            DataIdentifier::Document(kind) => either::Either::Left(kind),
            _ => either::Either::Right(self.get_data(di.clone()).map(|data| match data {
                VaultedData::Sealed(e_data) => Either::Left((di.clone(), e_data)),
                VaultedData::NonPrivate(p_data) => Either::Right((di.clone(), p_data.clone())),
            })),
        });
        let (e_data, p_data): (_, Vec<_>) = remaining_dis.into_iter().flatten().partition_map(|x| x);

        // special case decrypt documents
        let documents: HashMap<DataIdentifier, PiiString> = {
            let document_datas: Vec<&DocumentData> = documents_kinds
                .into_iter()
                .filter_map(|kind| self.get_document(kind))
                .collect();

            let decrypted_documents: Vec<PiiString> = enclave_client
                .batch_decrypt_documents(&self.vault.e_private_key, &document_datas)
                .await?
                .into_iter()
                .map(PiiBytes::into_leak_base64_pii)
                .collect();

            document_datas
                .into_iter()
                .map(|doc| DataIdentifier::Document(doc.kind))
                .zip(decrypted_documents)
                .collect()
        };

        // decrypt remaining e_data
        let text = enclave_client
            .batch_decrypt_to_piistring(e_data, &self.vault.e_private_key, DataTransform::Identity)
            .await?;

        // Don't make access events for the DIs that are already in plaintext
        let decrypted_dis = ids
            .iter()
            .filter(|di| !p_data.iter().any(|(d, _)| &d == di))
            .cloned()
            .collect();
        let results = documents
            .into_iter()
            .chain(text.into_iter())
            .chain(p_data.into_iter())
            .collect();

        let result = DecryptUncheckedResult {
            results,
            decrypted_dis,
        };
        Ok(result)
    }

    /// Util to decrypt a DataIdentifier WITHOUT checking permissions or making an access event.
    pub async fn decrypt_unchecked_single(
        &self,
        enclave_client: &EnclaveClient,
        id: DataIdentifier,
    ) -> ApiResult<Option<PiiString>> {
        let result = self
            .decrypt_unchecked(enclave_client, &[id])
            .await?
            .results
            .into_iter()
            .next()
            .map(|(_, pii)| pii);
        Ok(result)
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
            .decrypt_unchecked_single(&state.enclave_client, IDK::PhoneNumber.into())
            .await?
            .ok_or(ApiError::NoPhoneNumberForVault)?;
        let phone_number = PhoneNumber::parse(e164)?;
        Ok(phone_number)
    }
}
