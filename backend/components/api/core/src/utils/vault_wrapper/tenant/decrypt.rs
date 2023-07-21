use super::{DecryptRequest, TenantVw};
use crate::auth::AuthError;
use crate::utils::vault_wrapper::decrypt::{EnclaveDecryptOperation, Pii};
use crate::{errors::ApiResult, State};
use itertools::Itertools;
use newtypes::{DataIdentifier, IntegritySigningKey, PiiString};
use std::collections::HashMap;

impl<Type> TenantVw<Type> {
    /// if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    /// don't allow the tenant to know if data is set without having permission for the the value
    pub fn check_ob_config_access(&self, ids: &[DataIdentifier]) -> ApiResult<()> {
        let cannot_access = ids
            .iter()
            .filter(|x| !self.can_decrypt((*x).clone()))
            .collect_vec();
        if !cannot_access.is_empty() {
            let cannot_access_fields_str = cannot_access.into_iter().map(|x| x.to_string()).join(", ");
            return Err(AuthError::MissingDecryptPermission(cannot_access_fields_str).into());
        }

        Ok(())
    }

    /// Like `fn_decrypt` with no transform
    pub async fn decrypt(
        &self,
        state: &State,
        dis: &[DataIdentifier],
        req: DecryptRequest,
    ) -> ApiResult<HashMap<EnclaveDecryptOperation, PiiString>> {
        let dis: Vec<_> = dis.iter().map(|di| (di.clone(), vec![])).collect();
        self.fn_decrypt(state, dis, req).await
    }

    /// Compute integrity signed hashes with `fn_decrypt` using hmac-sha256 data transform
    pub async fn compute_integrity_signed_hashes(
        &self,
        state: &State,
        dis: &[DataIdentifier],
        key: IntegritySigningKey,
        req: DecryptRequest,
    ) -> ApiResult<HashMap<EnclaveDecryptOperation, PiiString>> {
        let dis: Vec<_> = dis
            .iter()
            .map(|di| {
                (
                    di.clone(),
                    vec![enclave_proxy::DataTransform::HmacSha256 { key: key.leak() }],
                )
            })
            .collect();
        self.fn_decrypt(state, dis, req).await
    }

    /// Util to transform decrypt a list of T where T represents a DataIdentifier. Returns a hashmap of T to
    /// the decrypted PiiString.
    /// Note: a provided id may not be included as a key in the resulting hashmap if the identifier
    /// doesn't have any associated data on the UVW.
    #[tracing::instrument("TenantVw::fn_decrypt", skip_all)]
    pub async fn fn_decrypt(
        &self,
        state: &State,
        dis_and_transforms: Vec<(DataIdentifier, Vec<enclave_proxy::DataTransform>)>,
        req: DecryptRequest,
    ) -> ApiResult<HashMap<EnclaveDecryptOperation, PiiString>> {
        let dis = dis_and_transforms.iter().map(|(di, _)| di.clone()).collect_vec();
        self.check_ob_config_access(dis.as_slice())?;
        let results = self
            .fn_decrypt_unchecked(&state.enclave_client, dis_and_transforms)
            .await?;
        req.create_access_event(state, &self.scoped_vault, results.decrypted_dis)
            .await?;
        Ok(results.results)
    }

    /// Like `fn_decrypt` with no transform
    pub async fn decrypt_single_raw(
        &self,
        state: &State,
        di: DataIdentifier,
        req: DecryptRequest,
    ) -> ApiResult<Option<Pii>> {
        self.check_ob_config_access(&[di.clone()])?;
        let results = self
            .fn_decrypt_unchecked_raw(&state.enclave_client, vec![(di, vec![])])
            .await?;
        req.create_access_event(state, &self.scoped_vault, results.decrypted_dis)
            .await?;
        let result = results.results.into_iter().next().map(|(_, v)| v);
        Ok(result)
    }
}
