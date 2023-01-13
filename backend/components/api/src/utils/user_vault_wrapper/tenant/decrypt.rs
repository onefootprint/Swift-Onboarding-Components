use super::{DecryptRequest, TenantUvw};
use crate::{errors::ApiResult, State};
use newtypes::{DataIdentifier, PiiString};
use std::collections::HashMap;
use std::hash::Hash;

impl TenantUvw {
    /// Returns a list of DataIdentifiers that exist in the vault
    pub fn get_populated_values<T>(&self, ids: &[T]) -> Vec<T>
    where
        T: Into<DataIdentifier> + Clone + Hash + Eq,
    {
        self.get_e_datas(ids).into_keys().collect()
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
        let results = self.uvw.decrypt_unsafe(state, ids).await?;
        if let Some(req) = req {
            let targets = ids.iter().cloned().map(|x| x.into()).collect();
            req.create_access_event(state, self.scoped_user_id.clone(), targets)
                .await?;
        }
        Ok(results)
    }
}
