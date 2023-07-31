use crate::State;
use crate::{errors::ApiResult, utils::vault_wrapper::decrypt::EnclaveDecryptOperation};
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use newtypes::{AccessEventKind, DbActor};

#[derive(Clone)]
pub struct DecryptRequest {
    pub reason: String,
    pub principal: DbActor,
    pub insight: CreateInsightEvent,
    pub targets: Vec<EnclaveDecryptOperation>,
}

impl DecryptRequest {
    /// note: decrypted_dis are a subset of targets
    /// as not all targets need be PII.
    pub(super) async fn create_access_event(
        self,
        state: &State,
        scoped_vault: &ScopedVault,
        decrypted_dis: Vec<EnclaveDecryptOperation>,
    ) -> ApiResult<()> {
        let DecryptRequest {
            reason,
            principal,
            insight,
            targets: _,
        } = self;
        let event = NewAccessEvent {
            scoped_vault_id: scoped_vault.id.clone(),
            tenant_id: scoped_vault.tenant_id.clone(),
            is_live: scoped_vault.is_live,
            reason: Some(reason),
            principal,
            insight,
            kind: AccessEventKind::Decrypt,
            // TODO: also store the transforms!
            targets: decrypted_dis.into_iter().map(|t| t.identifier).collect(),
        };
        state.db_pool.db_query(|conn| event.create(conn)).await??;
        Ok(())
    }
}
