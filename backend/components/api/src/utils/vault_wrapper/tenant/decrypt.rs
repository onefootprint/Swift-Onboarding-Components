use super::{DecryptRequest, TenantUvw};
use crate::auth::tenant::{CanDecrypt, IsGuardMet};
use crate::auth::AuthError;
use crate::{errors::ApiResult, State};
use itertools::Itertools;
use newtypes::{DataIdentifier, PiiString, TenantScope};
use std::collections::HashMap;
use std::hash::Hash;

impl TenantUvw {
    /// if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    /// don't allow the tenant to know if data is set without having permission for the the value
    pub fn check_ob_config_access<T>(&self, ids: &[T]) -> ApiResult<()>
    where
        T: Into<DataIdentifier> + Clone,
    {
        // tenants can do what they wish with NON-portable vaults they own
        if !self.vault.is_portable {
            return Ok(());
        }

        let can_decrypt_scopes: Vec<_> = self
            .onboarding
            .iter()
            .flat_map(|ob| ob.can_decrypt_scopes())
            // All custom data belonging to the tenant is allowed to be decrypted
            .chain([TenantScope::DecryptCustom])
            .collect();

        let cannot_access_fields = ids
            .iter()
            .map(|x| (x.clone()).into())
            .filter(|x| !CanDecrypt::single(x.clone()).is_met(&can_decrypt_scopes))
            .collect_vec();
        if !cannot_access_fields.is_empty() {
            let cannot_access_fields_str = cannot_access_fields.into_iter().map(|x| x.to_string()).join(", ");
            return Err(AuthError::ObConfigMissingDecryptPermission(cannot_access_fields_str).into());
        }

        Ok(())
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
        self.check_ob_config_access(ids)?;
        let results = self.uvw.decrypt_unsafe(&state.enclave_client, ids).await?;
        if let Some(req) = req {
            let targets = ids.iter().cloned().map(|x| x.into()).collect();
            req.create_access_event(state, self.scoped_user_id.clone(), targets)
                .await?;
        }
        Ok(results)
    }
}
