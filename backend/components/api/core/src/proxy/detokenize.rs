use crate::auth::tenant::TenantAuth;
use crate::errors::tenant::TenantError;
use crate::errors::ApiResult;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::bulk_decrypt;
use crate::utils::vault_wrapper::BulkDecryptReq;
use crate::utils::vault_wrapper::DecryptAccessEventInfo;
use crate::utils::vault_wrapper::EnclaveDecryptOperation;
use crate::utils::vault_wrapper::TenantVw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::AccessEventPurpose;
use newtypes::FpId;
use newtypes::PiiString;
use newtypes::ProxyToken;
use std::collections::HashMap;

const MAX_NUM_FP_IDS_PER_BATCH: usize = 10_000;

/// turns tokens -> PII
/// TODO: depending on usage this function can be optimized greatly:
///     - concurrent async (dispatch concurrent all per-fpid)
///
/// Big TODO: create a shared decryption utility instead of duplicating code across all the places we decrypt.
pub async fn detokenize(
    state: &State,
    auth: &dyn TenantAuth,
    tokens: Vec<ProxyToken>,
    reason: Option<String>,
    insight: InsightHeaders,
    purpose: AccessEventPurpose,
) -> ApiResult<HashMap<ProxyToken, PiiString>> {
    // split tokens by fp_id
    let tokens = tokens
        .into_iter()
        .map(|tok| (tok.fp_id, (tok.identifier, tok.filter_functions)))
        .into_group_map();

    let fp_ids = tokens.keys().cloned().collect_vec();
    tracing::info!(num_fp_ids=%fp_ids.len(), "Detokenizing fp_ids");
    if fp_ids.len() > MAX_NUM_FP_IDS_PER_BATCH {
        tracing::error!("Attempting to detokenize more than max allowed fp_ids");
    }
    if fp_ids.len() > 5_000 {
        tracing::error!("Attempting to detokenize more than max allowed fp_ids, lower limit");
    }
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let vws: HashMap<FpId, TenantVw> = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let svs = ScopedVault::bulk_get(conn, fp_ids, &tenant_id, is_live)?;
            let vws = VaultWrapper::multi_get_for_tenant(conn, svs, None)?;
            Ok(vws)
        })
        .await??
        .into_values()
        .map(|vw| (vw.scoped_vault.fp_id.clone(), vw))
        .collect();

    let decrypt_reqs = tokens
        .into_iter()
        .map(|(fp_id, targets)| -> ApiResult<_> {
            let vw = vws
                .get(&fp_id)
                .ok_or(TenantError::VaultDoesntExist(fp_id.clone()))?;
            let targets = targets
                .into_iter()
                .map(|(identifier, transforms)| EnclaveDecryptOperation::new(identifier, transforms))
                .collect();
            let key = vw.scoped_vault.fp_id.clone();
            Ok((key, BulkDecryptReq { vw, targets }))
        })
        .collect::<ApiResult<_>>()?;
    let reason = reason.unwrap_or_else(|| "Vault Proxy Default Reason".to_string());
    let insight = CreateInsightEvent::from(insight);
    let actor = auth.actor().into();
    let access_event = DecryptAccessEventInfo::AccessEvent {
        insight,
        reason,
        principal: actor,
        purpose,
    };
    let decrypted_results = bulk_decrypt(state, decrypt_reqs, access_event).await?;

    let out = decrypted_results
        .into_iter()
        .map(|(fp_id, results)| -> ApiResult<_> {
            let results = results
                .into_iter()
                .map(|(op, pii)| -> ApiResult<_> {
                    let token = ProxyToken {
                        fp_id: fp_id.clone(),
                        identifier: op.identifier,
                        filter_functions: op.transforms,
                    };
                    let pii = pii.to_piistring()?;
                    Ok((token, pii))
                })
                .collect::<ApiResult<Vec<_>>>()?;
            Ok(results)
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .flatten()
        .collect();
    Ok(out)
}
