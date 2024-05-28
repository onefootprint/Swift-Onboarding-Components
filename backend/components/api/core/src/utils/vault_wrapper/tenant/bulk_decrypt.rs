use db::models::audit_event::{AuditEvent, NewAuditEvent};
use std::collections::HashMap;

use db::models::{
    access_event::{AccessEvent, NewAccessEventRow},
    insight_event::CreateInsightEvent,
};
use itertools::Itertools;
use newtypes::{
    output::Csv, AccessEventKind, AccessEventPurpose, AuditEventDetail, AuditEventId, DataIdentifier,
    DbActor, PiiJsonValue,
};

use crate::{
    errors::{ApiResult, AssertionError},
    utils::vault_wrapper::{
        batch_execute_decrypt_requests, decrypt::EnclaveDecryptOperation, Any, DecryptUncheckedResult,
    },
    State,
};

use super::TenantVw;

/// Represents a request to decrypt targets for a specific VaultWrapper instance. Use the key to
/// uniquely identify the VW
pub struct BulkDecryptReq<'a, T = Any> {
    pub vw: &'a TenantVw<T>,
    pub targets: Vec<EnclaveDecryptOperation>,
}

const EVENT_CREATE_BATCH_SIZE: usize = 500;

/// Represents all the info needed to make an access event during decryption
#[allow(clippy::large_enum_variant)]
pub enum DecryptAccessEventInfo {
    // Could use an Option<>, but this forces the caller to explicitly consent to NoAccessEvent
    AccessEvent {
        insight: CreateInsightEvent,
        reason: String,
        principal: DbActor,
        purpose: AccessEventPurpose,
    },
    NoAccessEvent,
}

pub type DecryptedData = HashMap<EnclaveDecryptOperation, PiiJsonValue>;

#[tracing::instrument(skip_all)]
pub async fn bulk_decrypt<'a, TKey, T>(
    state: &State,
    requests: HashMap<TKey, BulkDecryptReq<'a, T>>,
    // maybe unchecked too so it doesn't error if the user can't decrypt???
    // integration test for user with role that can't decrypt
    access_event: DecryptAccessEventInfo,
) -> ApiResult<Vec<(TKey, DecryptedData)>>
where
    TKey: Eq + std::hash::Hash + 'static + Clone,
{
    let requests = requests
        .into_iter()
        .map(|(k, r)| -> ApiResult<_> {
            let BulkDecryptReq { vw, targets } = r;
            let targets = r.vw.check_ob_config_access(targets)?;
            let req = BulkDecryptReq { vw, targets };
            Ok((k, req))
        })
        .collect::<ApiResult<Vec<_>>>()?;

    let decrypt_requests = requests
        .iter()
        .flat_map(|(key, r)| {
            r.vw.decrypt_requests(r.targets.clone())
                .into_iter()
                .map(|result| (key.clone(), result))
        })
        .collect();
    let key_to_sv: HashMap<_, _> = requests
        .iter()
        .map(|(key, r)| (key.clone(), r.vw.scoped_vault.clone()))
        .collect();
    let targets = requests.iter().flat_map(|(_, r)| &r.targets).unique().collect();
    tracing::info!(targets=?Csv(targets), "Bulk decrypting, across potentially multiple VWs");

    let results = batch_execute_decrypt_requests(&state.enclave_client, decrypt_requests).await?;

    // Separate the results into access events and decrypted results
    let (access_events, decrypted_results): (Vec<_>, Vec<_>) = results
        .into_iter()
        .map(|(key, res)| -> ApiResult<_> {
            let DecryptUncheckedResult::<PiiJsonValue> {
                decrypted_dis,
                results,
            } = res.map_to_piijsonvalues()?;
            let decrypted_dis = decrypted_dis.into_iter().map(|t| t.identifier).collect_vec();
            let sv = key_to_sv
                .get(&key)
                .ok_or(AssertionError("No ScopedVault for key"))?;
            let access_event = (sv.fp_id.clone(), decrypted_dis);
            let decrypted_result = (key, results);
            Ok((access_event, decrypted_result))
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .unzip();

    let access_events = access_events.into_iter().into_group_map();
    let mut fp_id_to_sv: HashMap<_, _> = key_to_sv.into_values().map(|sv| (sv.fp_id.clone(), sv)).collect();

    // Bulk save all new access events in the DB. We'll use only one insight event for all of the
    // access events
    if let DecryptAccessEventInfo::AccessEvent {
        reason,
        principal,
        purpose,
        insight,
    } = access_event
    {
        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let insight = insight.insert_with_conn(conn)?;

                let access_and_audit_events = access_events
                    .into_iter()
                    .map(|(fp_id, targets)| -> ApiResult<_> {
                        let sv = fp_id_to_sv
                            .remove(&fp_id)
                            .ok_or(AssertionError("No ScopedVault for key"))?;
                        // Combine decrypts for one fp_id into a single access event
                        let targets: Vec<DataIdentifier> = targets.into_iter().flatten().unique().collect();
                        // NOTE: If we add any more fields to the access event, we might have to lower
                        // the chunk size below or we'll hit a max size for an insert statement.
                        let aeid = AuditEventId::generate();
                        let access_event = NewAccessEventRow {
                            id: aeid.clone().into_correlated_access_event_id(),
                            scoped_vault_id: sv.id.clone(),
                            tenant_id: sv.tenant_id.clone(),
                            is_live: sv.is_live,
                            // TODO: also store the transforms!
                            targets: targets.clone(),
                            insight_event_id: insight.id.clone(),
                            reason: Some(reason.clone()),
                            principal: principal.clone(),
                            kind: AccessEventKind::Decrypt,
                            purpose,
                        };

                        let audit_event = NewAuditEvent {
                            id: aeid,
                            tenant_id: sv.tenant_id,
                            principal_actor: principal.clone(),
                            insight_event_id: insight.id.clone(),
                            detail: AuditEventDetail::DecryptUserData {
                                is_live: sv.is_live,
                                scoped_vault_id: sv.id,
                                reason: reason.clone(),
                                decrypted_fields: targets,
                            },
                        };

                        Ok((access_event, audit_event))
                    })
                    .collect::<ApiResult<Vec<_>>>()?;

                for chunk in access_and_audit_events
                    .into_iter()
                    .chunks(EVENT_CREATE_BATCH_SIZE)
                    .into_iter()
                {
                    let (access_events, audit_events) = chunk.into_iter().unzip();
                    AccessEvent::bulk_create(conn, access_events)?;
                    AuditEvent::bulk_create(conn, audit_events)?;
                }
                Ok(())
            })
            .await?;
    }

    Ok(decrypted_results)
}
