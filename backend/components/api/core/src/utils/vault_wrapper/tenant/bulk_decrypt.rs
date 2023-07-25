use std::collections::HashMap;

use db::models::{
    access_event::{AccessEvent, NewAccessEventRow},
    insight_event::CreateInsightEvent,
};
use enclave_proxy::DataTransform;
use itertools::Itertools;
use newtypes::{AccessEventKind, DataIdentifier, DbActor, FpId, PiiString};

use crate::{
    errors::{ApiResult, AssertionError},
    utils::vault_wrapper::{
        batch_execute_decrypt_requests, decrypt::EnclaveDecryptOperation, Any, DecryptUncheckedResult,
    },
    State,
};

use super::TenantVw;

pub struct BulkDecryptReq<T = Any> {
    pub vw: TenantVw<T>,
    pub targets: Vec<(DataIdentifier, Vec<DataTransform>)>,
}

pub async fn bulk_decrypt<T>(
    state: &State,
    requests: Vec<BulkDecryptReq<T>>,
    insight: CreateInsightEvent,
    reason: String,
    principal: DbActor,
) -> ApiResult<Vec<(FpId, HashMap<EnclaveDecryptOperation, PiiString>)>> {
    for r in requests.iter() {
        let dis = r.targets.iter().map(|(di, _)| di).collect_vec();
        r.vw.check_ob_config_access(dis)?;
    }

    let decrypt_requests = requests
        .iter()
        .flat_map(|i| {
            i.vw.decrypt_requests(i.targets.clone())
                .into_iter()
                .map(|r| (i.vw.scoped_vault.fp_id.clone(), r))
        })
        .collect();
    let mut fp_id_to_scoped_vault: HashMap<_, _> = requests
        .iter()
        .map(|BulkDecryptReq { vw, targets: _ }| (vw.scoped_vault.fp_id.clone(), vw.scoped_vault.clone()))
        .collect();

    let results = batch_execute_decrypt_requests(&state.enclave_client, decrypt_requests).await?;

    // Separate the results into access events and decrypted results
    let (access_events, decrypted_results): (Vec<_>, Vec<_>) = results
        .into_iter()
        .map(|(fp_id, res)| -> ApiResult<_> {
            let DecryptUncheckedResult::<PiiString> {
                decrypted_dis,
                results,
            } = res.map_to_piistrings()?;
            let decrypted_dis = decrypted_dis.into_iter().map(|t| t.identifier).collect_vec();
            let access_event = (fp_id.clone(), decrypted_dis);
            let decrypted_result = (fp_id, results);
            Ok((access_event, decrypted_result))
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .unzip();

    // Bulk save all new access events in the DB. We'll use only one insight event for all of the
    // access events
    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let insight = insight.insert_with_conn(conn)?;
            let access_events = access_events
                .into_iter()
                .map(|(fp_id, targets)| -> ApiResult<_> {
                    let sv = fp_id_to_scoped_vault
                        .remove(&fp_id)
                        .ok_or(AssertionError("No ScopedVault for fp_id"))?;
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
