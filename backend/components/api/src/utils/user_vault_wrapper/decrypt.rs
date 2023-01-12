use super::UserVaultWrapper;
use crate::errors::{ApiError, ApiResult};
use crate::State;
use crypto::aead::SealingKey;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use enclave_proxy::DataTransform;
use newtypes::{
    AccessEventKind, DataIdentifier, DbActor, PiiString, ScopedUserId, SealedVaultBytes, SealedVaultDataKey,
    ValidatedPhoneNumber,
};
use std::collections::HashMap;
use std::convert::Into;
use std::hash::Hash;

impl UserVaultWrapper {
    /// Retrieve the e_data for each of the provided DataIdentifiers, if exists
    pub fn get_e_datas<T>(&self, ids: &[T]) -> HashMap<T, &SealedVaultBytes>
    where
        T: Into<DataIdentifier> + Clone + Hash + Eq,
    {
        HashMap::from_iter(ids.iter().filter_map(|di| {
            match Into::<DataIdentifier>::into(di.clone()) {
                DataIdentifier::Custom(k) => self.kv_data().get(&k).map(|kvd| &kvd.e_data),
                DataIdentifier::Id(idk) => self.get_identity_e_field(idk),
                // Decrypt key here
                DataIdentifier::IdDocument => todo!(),
            }
            .map(|e_data| (di.clone(), e_data))
        }))
    }

    /// Util to decrypt a list of T where T represents a DataIdentifier. Returns a hashmap of T to
    /// the decrypted PiiString.
    /// Note: a provided id may not be included as a key in the resulting hashmap if the identifier
    /// doesn't have any associated data on the UVW.
    pub async fn decrypt<T>(
        &self,
        state: &State,
        ids: &[T],
        req: Option<DecryptRequest>,
    ) -> ApiResult<HashMap<T, PiiString>>
    where
        T: Into<DataIdentifier> + Clone + Hash + Eq,
    {
        let (ids, e_datas): (Vec<_>, _) = self.get_e_datas(ids).into_iter().unzip();

        let decrypted_results = state
            .enclave_client
            .batch_decrypt_to_piistring(e_datas, &self.user_vault.e_private_key, DataTransform::Identity)
            .await?;
        let targets = ids.clone().into_iter().map(|id| id.into()).collect();
        let results: HashMap<_, _> = ids.into_iter().zip(decrypted_results).collect();

        if let Some(req) = req {
            let scoped_user_id = self.scoped_user_id_or_else(|| {
                ApiError::AssertionError("Don't need reason for non-tenant decrypt".to_owned())
            })?;
            req.create_access_event(state, scoped_user_id, targets).await?;
        }
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
            .batch_decrypt_to_piistring(e_datas, &self.user_vault.e_private_key, DataTransform::Identity)
            .await?;
        let e164 = decrypt_response.get(0).ok_or(ApiError::NotImplemented)?.clone();
        let country = decrypt_response.get(1).ok_or(ApiError::NotImplemented)?.clone();

        let validated_phone_number = ValidatedPhoneNumber::__build_from_vault(e164, country)?;
        Ok(validated_phone_number)
    }
}

pub struct DecryptRequest {
    pub reason: String,
    pub principal: DbActor,
    pub insight: CreateInsightEvent,
}

impl DecryptRequest {
    pub(super) async fn create_access_event(
        self,
        state: &State,
        scoped_user_id: ScopedUserId,
        targets: Vec<DataIdentifier>,
    ) -> ApiResult<()> {
        let DecryptRequest {
            reason,
            principal,
            insight,
        } = self;
        let event = NewAccessEvent {
            scoped_user_id,
            reason: Some(reason),
            principal,
            insight,
            kind: AccessEventKind::Decrypt,
            targets,
        };
        state.db_pool.db_query(|conn| event.create(conn)).await??;
        Ok(())
    }
}
