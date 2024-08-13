use super::TenantVw;
use crate::utils::vault_wrapper::decrypt::EnclaveDecryptOperation;
use crate::utils::vault_wrapper::decrypt::Pii;
use crate::FpResult;
use crate::State;
use db::models::audit_event::AuditEvent;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use itertools::Itertools;
use newtypes::AuditEventDetail;
use newtypes::DataIdentifier;
use newtypes::DbActor;
use newtypes::DecryptionContext;
use std::collections::HashMap;

impl<Type> TenantVw<Type> {
    /// Before decrypting, filter out fields are not decryptable by the ob configs on this VW.
    pub(super) fn check_ob_config_access(
        &self,
        targets: Vec<EnclaveDecryptOperation>,
    ) -> FpResult<Vec<EnclaveDecryptOperation>> {
        let can_access = targets
            .into_iter()
            .filter(|x| !self.has_field(&x.identifier) || self.tenant_can_decrypt(x.identifier.clone()))
            .collect_vec();
        // TODO should this error if you don't have access?
        // Nobody is really using the can_access_data feature right now, so we don't really have to solve
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
        context: DecryptionContext,
    ) -> FpResult<HashMap<EnclaveDecryptOperation, Pii>> {
        let targets = self.check_ob_config_access(targets)?;
        let results = self
            .fn_decrypt_unchecked_raw(&state.enclave_client, targets)
            .await?;

        let scoped_vault_id = self.scoped_vault.id.clone();
        let tenant_id = self.scoped_vault.tenant_id.clone();
        let is_live = self.scoped_vault.is_live;

        state
            .db_pool
            .db_transaction(move |conn| -> FpResult<_> {
                let insight_event_id = insight.insert_with_conn(conn)?.id;

                let targets: Vec<DataIdentifier> =
                    results.decrypted_dis.into_iter().map(|t| t.identifier).collect();

                let event = NewAuditEvent {
                    tenant_id,
                    principal_actor: principal,
                    insight_event_id,
                    detail: AuditEventDetail::DecryptUserData {
                        is_live,
                        scoped_vault_id,
                        reason,
                        context,
                        // TODO: also store the transforms!
                        decrypted_fields: targets,
                    },
                };
                AuditEvent::create(conn, event)?;

                Ok(())
            })
            .await?;
        Ok(results.results)
    }
}
