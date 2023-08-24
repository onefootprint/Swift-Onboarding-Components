use super::TenantVw;
use crate::auth::AuthError;
use crate::utils::vault_wrapper::decrypt::{EnclaveDecryptOperation, Pii};
use crate::{errors::ApiResult, State};
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use itertools::Itertools;
use newtypes::{AccessEventKind, AccessEventPurpose, DataIdentifier, DbActor};
use std::collections::HashMap;

impl<Type> TenantVw<Type> {
    // Before decrypting, asserts that the requested fields are decryptable by this VW
    pub(super) fn check_ob_config_access(&self, ids: Vec<&DataIdentifier>) -> ApiResult<()> {
        let cannot_access = ids
            .into_iter()
            .filter(|x| self.has_field((*x).clone()))
            .filter(|x| !self.can_decrypt((*x).clone()))
            .collect_vec();
        if !cannot_access.is_empty() {
            let cannot_access_fields_str = cannot_access.into_iter().map(|x| x.to_string()).join(", ");
            return Err(AuthError::MissingDecryptPermission(cannot_access_fields_str).into());
        }

        Ok(())
    }

    /// like `fn_decrypt` but raw bytes or string result
    #[tracing::instrument("TenantVw::fn_decrypt", skip_all)]
    pub async fn fn_decrypt_raw(
        &self,
        state: &State,
        reason: String,
        principal: DbActor,
        insight: CreateInsightEvent,
        targets: Vec<EnclaveDecryptOperation>,
        purpose: AccessEventPurpose,
    ) -> ApiResult<HashMap<EnclaveDecryptOperation, Pii>> {
        let dis = targets.iter().map(|op| &op.identifier).collect();
        self.check_ob_config_access(dis)?;
        let results = self
            .fn_decrypt_unchecked_raw(&state.enclave_client, targets)
            .await?;

        let event = NewAccessEvent {
            scoped_vault_id: self.scoped_vault.id.clone(),
            tenant_id: self.scoped_vault.tenant_id.clone(),
            is_live: self.scoped_vault.is_live,
            reason: Some(reason),
            principal,
            insight,
            kind: AccessEventKind::Decrypt,
            // TODO: also store the transforms!
            targets: results.decrypted_dis.into_iter().map(|t| t.identifier).collect(),
            purpose,
        };
        state.db_pool.db_query(|conn| event.create(conn)).await??;
        Ok(results.results)
    }
}
