use crate::auth::tenant::TenantAuth;
use crate::errors::tenant::TenantError;
use crate::errors::ApiResult;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::bulk_decrypt;
use crate::utils::vault_wrapper::BulkDecryptReq;
use crate::utils::vault_wrapper::EnclaveDecryptOperation;
use crate::utils::vault_wrapper::TenantVw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::FpId;
use newtypes::PiiString;
use newtypes::ProxyToken;
use std::collections::HashMap;

use super::filter_function_to_transform;
use super::transform_to_filter_function;

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
) -> ApiResult<HashMap<ProxyToken, PiiString>> {
    // split tokens by fp_id
    let tokens = tokens
        .into_iter()
        .map(|tok| (tok.fp_id, (tok.identifier, tok.filter_functions)))
        .into_group_map();

    let fp_ids = tokens.keys().cloned().collect_vec();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let mut vws: HashMap<FpId, TenantVw> = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let svs = ScopedVault::bulk_get(conn, fp_ids, &tenant_id, is_live)?;
            let vws = VaultWrapper::multi_get_for_tenant(conn, svs, &tenant_id, None)?;
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
                .remove(&fp_id)
                .ok_or(TenantError::VaultDoesntExist(fp_id.clone()))?;
            let targets = targets
                .into_iter()
                .map(|(identifier, filters)| {
                    let transforms = filters.iter().map(filter_function_to_transform).collect_vec();
                    EnclaveDecryptOperation {
                        identifier,
                        transforms,
                    }
                })
                .collect();
            Ok(BulkDecryptReq { vw, targets })
        })
        .collect::<ApiResult<_>>()?;
    let reason = reason.unwrap_or_else(|| "Vault Proxy Default Reason".to_string());
    let insight = CreateInsightEvent::from(insight);
    let decrypted_results = bulk_decrypt(state, decrypt_reqs, insight, reason, auth.actor().into()).await?;

    let out = decrypted_results
        .into_iter()
        .flat_map(|(fp_id, results)| {
            results
                .into_iter()
                .map(|(op, pii)| {
                    let filter_functions = op
                        .transforms
                        .into_iter()
                        .filter_map(transform_to_filter_function)
                        .collect();
                    let token = ProxyToken {
                        fp_id: fp_id.clone(),
                        identifier: op.identifier,
                        filter_functions,
                    };
                    (token, pii)
                })
                .collect_vec()
        })
        .collect();
    Ok(out)
}
