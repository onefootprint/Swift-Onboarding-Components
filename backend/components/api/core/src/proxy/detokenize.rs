use std::collections::HashMap;

use crate::auth::tenant::TenantAuth;

use crate::errors::ApiResult;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::DecryptRequest;
use crate::utils::vault_wrapper::TenantVw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;

use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;

use itertools::Itertools;

use newtypes::PiiString;
use newtypes::ProxyToken;

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
    let mut out = HashMap::new();

    // split tokens by fp_id
    let tokens = tokens
        .into_iter()
        .map(|tok| (tok.fp_id, (tok.identifier, tok.filter_functions)))
        .into_group_map();

    for (fp_id, targets) in tokens {
        let tenant_id = auth.tenant().id.clone();
        let is_live = auth.is_live()?;

        let (uvw, scoped_user) = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
                let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
                // TODO how do we check perms for custom data? feels like always allowed, only gated
                // by tenant_role. I think this will break rn
                Ok((uvw, scoped_user))
            })
            .await??;

        let req = DecryptRequest {
            reason: reason
                .clone()
                .unwrap_or_else(|| "Vault Proxy Default Reason".to_string()),
            principal: auth.actor().into(),
            insight: CreateInsightEvent::from(insight.clone()),
        };
        let targets = targets
            .into_iter()
            .map(|(di, filters)| {
                let transforms = filters.iter().map(filter_function_to_transform).collect_vec();
                (di, transforms)
            })
            .collect();

        let results = uvw
            .fn_decrypt(state, targets, req)
            .await?
            .into_iter()
            .map(|(op, v)| {
                let token = ProxyToken {
                    fp_id: scoped_user.fp_id.clone(),
                    identifier: op.identifier,
                    filter_functions: op
                        .transforms
                        .into_iter()
                        .filter_map(transform_to_filter_function)
                        .collect(),
                };
                (token, v)
            });
        out.extend(results);
    }

    Ok(out)
}

