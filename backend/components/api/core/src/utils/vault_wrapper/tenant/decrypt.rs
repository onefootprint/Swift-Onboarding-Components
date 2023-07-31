use super::{DecryptRequest, TenantVw};
use crate::auth::AuthError;
use crate::utils::vault_wrapper::decrypt::{EnclaveDecryptOperation, Pii};
use crate::{errors::ApiResult, State};
use itertools::Itertools;
use newtypes::{DataIdentifier, PiiString};
use std::collections::HashMap;

impl<Type> TenantVw<Type> {
    /// if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    /// don't allow the tenant to know if data is set without having permission for the the value
    pub fn check_ob_config_access(&self, ids: Vec<&DataIdentifier>) -> ApiResult<()> {
        let cannot_access = ids
            .into_iter()
            .filter(|x| !self.can_decrypt((*x).clone()))
            .collect_vec();
        if !cannot_access.is_empty() {
            let cannot_access_fields_str = cannot_access.into_iter().map(|x| x.to_string()).join(", ");
            return Err(AuthError::MissingDecryptPermission(cannot_access_fields_str).into());
        }

        Ok(())
    }

    /// Util to transform decrypt a list of T where T represents a DataIdentifier. Returns a hashmap of T to
    /// the decrypted PiiString.
    /// Note: a provided id may not be included as a key in the resulting hashmap if the identifier
    /// doesn't have any associated data on the UVW.
    #[tracing::instrument("TenantVw::fn_decrypt", skip_all)]
    pub async fn fn_decrypt(
        &self,
        state: &State,
        req: DecryptRequest,
    ) -> ApiResult<HashMap<EnclaveDecryptOperation, PiiString>> {
        let dis = req.targets.iter().map(|op| &op.identifier).collect();
        self.check_ob_config_access(dis)?;
        let targets = req
            .targets
            .iter()
            .map(|op| (op.identifier.clone(), op.transforms.clone()))
            .collect();
        let results = self.fn_decrypt_unchecked(&state.enclave_client, targets).await?;
        req.create_access_event(state, &self.scoped_vault, results.decrypted_dis).await?;
        Ok(results.results)
    }

    /// like `fn_decrypt` but raw bytes or string result
    #[tracing::instrument("TenantVw::fn_decrypt", skip_all)]
    pub async fn fn_decrypt_raw(
        &self,
        state: &State,
        req: DecryptRequest,
    ) -> ApiResult<HashMap<EnclaveDecryptOperation, Pii>> {
        let dis = req.targets.iter().map(|op| &op.identifier).collect();
        self.check_ob_config_access(dis)?;
        let targets = req
            .targets
            .iter()
            .map(|op| (op.identifier.clone(), op.transforms.clone()))
            .collect();
        let results = self
            .fn_decrypt_unchecked_raw(&state.enclave_client, targets)
            .await?;
        req.create_access_event(state, &self.scoped_vault, results.decrypted_dis).await?;
        Ok(results.results)
    }
}
