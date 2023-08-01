use std::{collections::HashMap, hash::Hash};

use db::models::{
    access_event::{AccessEvent, NewAccessEventRow},
    insight_event::CreateInsightEvent,
};
use itertools::Itertools;
use newtypes::{AccessEventKind, DbActor, PiiString};

use crate::{
    errors::{tenant::TenantError, ApiResult, AssertionError},
    utils::vault_wrapper::{
        batch_execute_decrypt_requests, decrypt::EnclaveDecryptOperation, Any, DecryptUncheckedResult,
    },
    State,
};

use super::TenantVw;

/// Represents a request to decrypt targets for a specific VaultWrapper instance. Use the key to
/// uniquely identify the VW
pub struct BulkDecryptReq<TKey, T = Any> {
    /// Something that uniquely identifies this VW from the others being decrypted at the same time
    pub key: TKey,
    pub vw: TenantVw<T>,
    pub targets: Vec<EnclaveDecryptOperation>,
}

pub async fn bulk_decrypt<TKey, T>(
    state: &State,
    requests: Vec<BulkDecryptReq<TKey, T>>,
    insight: CreateInsightEvent,
    reason: String,
    principal: DbActor,
) -> ApiResult<Vec<(TKey, HashMap<EnclaveDecryptOperation, PiiString>)>>
where
    TKey: Clone + Eq + Hash + 'static + Send,
{
    let count_unique_keys = requests.iter().map(|r| &r.key).unique().count();
    if count_unique_keys != requests.len() {
        return Err(TenantError::KeysMustBeUnique.into());
    }
    for r in requests.iter() {
        let dis = r.targets.iter().map(|op| &op.identifier).collect_vec();
        r.vw.check_ob_config_access(dis)?;
    }

    let decrypt_requests = requests
        .iter()
        .flat_map(|i| {
            i.vw.decrypt_requests(i.targets.clone())
                .into_iter()
                .map(|r| (i.key.clone(), r))
        })
        .collect();
    let key_to_sv: HashMap<_, _> = requests
        .iter()
        .map(|BulkDecryptReq { key, vw, targets: _ }| (key.clone(), vw.scoped_vault.clone()))
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
                .collect::<ApiResult<_>>()?;
            AccessEvent::bulk_create(conn, access_events)?;
            Ok(())
        })
        .await??;

    Ok(decrypted_results)
}
