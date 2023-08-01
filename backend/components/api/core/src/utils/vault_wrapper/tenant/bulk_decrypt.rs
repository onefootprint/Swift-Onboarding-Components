use std::collections::HashMap;

use db::models::{
    access_event::{AccessEvent, NewAccessEventRow},
    insight_event::CreateInsightEvent,
};
use itertools::Itertools;
use newtypes::{AccessEventKind, DbActor, PiiString};

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
pub struct BulkDecryptReq<T = Any> {
    pub vw: TenantVw<T>,
    pub targets: Vec<EnclaveDecryptOperation>,
}

const MAX_ACCESS_EVENTS: usize = 5000;

pub async fn bulk_decrypt<TKey, T>(
    state: &State,
    requests: HashMap<TKey, BulkDecryptReq<T>>,
    insight: CreateInsightEvent,
    reason: String,
    principal: DbActor,
) -> ApiResult<Vec<(TKey, HashMap<EnclaveDecryptOperation, PiiString>)>>
where
    TKey: Eq + std::hash::Hash + 'static + Clone,
{
    for r in requests.values() {
        let dis = r.targets.iter().map(|op| &op.identifier).collect_vec();
        r.vw.check_ob_config_access(dis)?;
    }

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

    let results = batch_execute_decrypt_requests(&state.enclave_client, decrypt_requests).await?;

    // Separate the results into access events and decrypted results
    let (access_events, decrypted_results): (Vec<_>, Vec<_>) = results
        .into_iter()
        .map(|(key, res)| -> ApiResult<_> {
            let DecryptUncheckedResult::<PiiString> {
                decrypted_dis,
                results,
            } = res.map_to_piistrings()?;
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
    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let insight = insight.insert_with_conn(conn)?;
            let access_events = access_events
                .into_iter()
                .map(|(fp_id, targets)| -> ApiResult<_> {
                    let sv = fp_id_to_sv
                        .remove(&fp_id)
                        .ok_or(AssertionError("No ScopedVault for key"))?;
                    // Combine decrypts for one fp_id into a single access event
                    let targets = targets.into_iter().flatten().unique().collect();
                    // NOTE: If we add any more fields to the access event, we might have to lower
                    // the chunk size below or we'll hit a max size for an insert statement.
                    let access_event = NewAccessEventRow {
                        scoped_vault_id: sv.id,
                        tenant_id: sv.tenant_id,
                        is_live: sv.is_live,
                        targets,
                        insight_event_id: insight.id.clone(),
                        reason: Some(reason.clone()),
                        principal: principal.clone(),
                        kind: AccessEventKind::Decrypt,
                    };
                    Ok(access_event)
                })
                .collect::<ApiResult<Vec<_>>>()?;

            for access_events in access_events.into_iter().chunks(MAX_ACCESS_EVENTS).into_iter() {
                AccessEvent::bulk_create(conn, access_events.into_iter().collect())?;
            }
            Ok(())
        })
        .await??;

    Ok(decrypted_results)
}
