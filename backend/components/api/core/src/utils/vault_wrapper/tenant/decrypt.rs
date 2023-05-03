use super::{DecryptRequest, TenantVw};
use crate::auth::AuthError;
use crate::auth::{CanDecrypt, IsGuardMet};
use crate::{errors::ApiResult, State};
use itertools::Itertools;
use newtypes::{DataIdentifier, PiiString, TenantScope};
use std::collections::HashMap;

impl<Type> TenantVw<Type> {
    /// if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    /// don't allow the tenant to know if data is set without having permission for the the value
    pub fn check_ob_config_access(&self, ids: &[DataIdentifier]) -> ApiResult<()> {
        if !self.vault.is_portable {
            // tenants can do what they wish with NON-portable vaults they own
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
            .filter(|x| !CanDecrypt::single((*x).clone()).is_met(&can_decrypt_scopes))
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
    pub async fn decrypt(
        &self,
        state: &State,
        dis: &[DataIdentifier],
        req: DecryptRequest,
    ) -> ApiResult<HashMap<DataIdentifier, PiiString>> {
        self.check_ob_config_access(dis)?;
        let results = self.uvw.decrypt_unchecked(&state.enclave_client, dis).await?;
        req.create_access_event(state, self.scoped_vault_id.clone(), results.decrypted_dis)
            .await?;
        Ok(results.results)
    }
}
