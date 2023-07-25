use std::collections::HashMap;

use db::models::{
    access_event::{AccessEvent, NewAccessEventRow},
    insight_event::CreateInsightEvent,
};
use enclave_proxy::DataTransform;
use futures_util::StreamExt;
use itertools::Itertools;
use newtypes::{AccessEventKind, DataIdentifier, DbActor, FpId, PiiString, ScopedVaultId, TenantId};

use crate::{
    errors::ApiResult,
    utils::vault_wrapper::{decrypt::EnclaveDecryptOperation, Any, DecryptUncheckedResult},
    State,
};

use super::TenantVw;

pub struct BulkDecryptReq<T = Any> {
    pub vw: TenantVw<T>,
    pub targets: Vec<(DataIdentifier, Vec<DataTransform>)>,
}

pub struct NewAccessEvent {
    scoped_vault_id: ScopedVaultId,
    tenant_id: TenantId,
    is_live: bool,
    targets: Vec<DataIdentifier>,
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

    // TODO actually decrypt the data in batch - we'll need to support an enclave operation that
    // decrypts data with multiple different keys
    let result_futs = requests
        .into_iter()
        .map(|r| single_decrypt(state, r))
        .collect_vec();

    // Do 10 vaults' decrypts in parallel
    let result_futs = futures::stream::iter(result_futs).buffer_unordered(10);
    let stream_collect = result_futs
        .collect::<Vec<_>>()
        .await
        .into_iter()
        .collect::<ApiResult<Vec<_>>>()?;
    let (access_events, decrypted_results): (Vec<_>, Vec<_>) = stream_collect
        .into_iter()
        .map(|(vw, res)| {
            // TODO i don't love that this is a different codepath from making other access events
            let access_event = NewAccessEvent {
                scoped_vault_id: vw.scoped_vault.id,
                tenant_id: vw.scoped_vault.tenant_id,
                is_live: vw.scoped_vault.is_live,
                targets: res.decrypted_dis.into_iter().map(|t| t.identifier).collect(),
            };
            (access_event, (vw.scoped_vault.fp_id, res.results))
        })
        .unzip();

    // Save access events for each decrypt. We'll use one insight event for each access event
    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let insight = insight.insert_with_conn(conn)?;
            let access_events = access_events
                .into_iter()
                .map(|r| NewAccessEventRow {
                    scoped_vault_id: r.scoped_vault_id,
                    tenant_id: r.tenant_id,
                    is_live: r.is_live,
                    targets: r.targets,
                    insight_event_id: insight.id.clone(),
                    reason: Some(reason.clone()),
                    principal: principal.clone(),
                    kind: AccessEventKind::Decrypt,
                })
                .collect();
            AccessEvent::bulk_create(conn, access_events)?;
            Ok(())
        })
        .await??;
    Ok(decrypted_results)
}

async fn single_decrypt<T>(
    state: &State,
    req: BulkDecryptReq<T>,
) -> ApiResult<(TenantVw<T>, DecryptUncheckedResult)> {
    let BulkDecryptReq { vw, targets } = req;
    let results = vw.fn_decrypt_unchecked(&state.enclave_client, targets).await?;
    Ok((vw, results))
}
