use super::TenantVw;
use crate::{
    errors::ApiResult,
    utils::vault_wrapper::decrypt::{EnclaveDecryptOperation, Pii},
    State,
};
use db::models::{access_event::NewAccessEvent, insight_event::CreateInsightEvent};
use itertools::Itertools;
use newtypes::{AccessEventKind, AccessEventPurpose, DbActor};
use std::collections::HashMap;

impl<Type> TenantVw<Type> {
    /// Before decrypting, filter out fields are not decryptable by the ob configs on this VW.
    pub(super) fn check_ob_config_access(
        &self,
        targets: Vec<EnclaveDecryptOperation>,
    ) -> ApiResult<Vec<EnclaveDecryptOperation>> {
        let can_access = targets
            .into_iter()
            .filter(|x| {
                !self.has_field((x.identifier).clone()) || self.tenant_can_decrypt(x.identifier.clone())
            })
            .collect_vec();
        Ok(can_access)
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
        let targets = self.check_ob_config_access(targets)?;
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
