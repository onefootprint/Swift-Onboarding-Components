use super::{DecryptRequest, TenantUvw};
use crate::auth::AuthError;
use crate::{errors::ApiResult, State};
use itertools::Itertools;
use newtypes::{DataIdentifier, PiiString};
use std::collections::{HashMap, HashSet};
use std::hash::Hash;

impl TenantUvw {
    /// if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    /// don't allow the tenant to know if data is set without having permission for the the value
    pub fn ensure_scope_allows_access<T>(&self, ids: &[T]) -> ApiResult<()>
    where
        T: Into<DataIdentifier> + Clone,
    {
        // tenants can do what they wish with NON-portable vaults they own
        if !self.user_vault.is_portable {
            return Ok(());
        }

        let can_access: HashSet<_> = self
            .authorized_ob_configs
            .iter()
            .flat_map(|x| x.can_access())
            .collect();
        let cannot_access_fields = ids
            .iter()
            .map(|x| (x.clone()).into())
            // All custom data belonging to the tenant is allowed to be decrypted
            .filter(|x| !matches!(x, DataIdentifier::Custom(_)))
            .filter(|x| !can_access.contains(x))
            .collect_vec();
        if !cannot_access_fields.is_empty() {
            return Err(AuthError::ObConfigMissingDecryptPermission(cannot_access_fields).into());
        }

        Ok(())
    }

    /// Returns a list of DataIdentifiers that exist in the vault
    pub fn get_populated_values<T>(&self, ids: &[T]) -> ApiResult<Vec<T>>
    where
        T: Into<DataIdentifier> + Clone + Hash + Eq,
    {
        self.ensure_scope_allows_access(ids)?;
        let results = self.get_e_datas(ids).into_keys().collect();
        Ok(results)
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
        self.ensure_scope_allows_access(ids)?;
        let results = self.uvw.decrypt_unsafe(state, ids).await?;
        if let Some(req) = req {
            let targets = ids.iter().cloned().map(|x| x.into()).collect();
            req.create_access_event(state, self.scoped_user_id.clone(), targets)
                .await?;
        }
        Ok(results)
    }
}
