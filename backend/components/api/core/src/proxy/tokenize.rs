use super::IngressRule;
use crate::auth::tenant::TenantAuth;
use crate::errors::ApiResult;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::AccessEventKind;
use newtypes::DataIdentifier;
use newtypes::DataRequest;
use newtypes::ParseOptions;
use newtypes::PiiString;
use std::collections::HashMap;

/// Vaults PII values
/// writes the PII token values to the vault
/// NOTE: we only limit proxy vaulting custom PII data
pub async fn vault_pii(
    state: &State,
    auth: &dyn TenantAuth,
    values: HashMap<IngressRule, PiiString>,
    insights: InsightHeaders,
) -> ApiResult<()> {
    // no need to DB ops if no ingress to vault
    if values.is_empty() {
        return Ok(());
    }
    // split by fp_id
    let values_by_user = values
        .into_iter()
        .map(|(rule, pii)| (rule.proxy_token.fp_id.clone(), (rule.proxy_token.identifier, pii)))
        .into_group_map();

    for (fp_id, values) in values_by_user {
        let tenant_id = auth.tenant().id.clone();
        let is_live = auth.is_live()?;
        let principal = auth.actor().into();
        let insight = CreateInsightEvent::from(insights.clone());

        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
                // TODO what happens if we want to vault data in a business vault?
                let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &scoped_user.id)?;

                // vault the custom data
                let custom: HashMap<_, _> = values
                    .iter()
                    .filter_map(|(di, value)| match di {
                        DataIdentifier::Selfie(_)
                        | DataIdentifier::Id(_)
                        | DataIdentifier::IdDocument(_)
                        | DataIdentifier::InvestorProfile(_)
                        | DataIdentifier::Business(_)
                        | DataIdentifier::Document(_) => None,
                        DataIdentifier::Custom(k) => Some((k.clone().into(), value.clone())),
                    })
                    .collect();

                if !custom.is_empty() {
                    NewAccessEvent {
                        scoped_vault_id: scoped_user.id.clone(),
                        reason: None,
                        principal,
                        insight,
                        kind: AccessEventKind::Update,
                        targets: custom.keys().cloned().collect(),
                    }
                    .create(conn)?;
                    // TODO could technically now support vaulting any kind of data instead of just custom. Just need to fingerprint data too
                    let data = DataRequest::clean_and_validate(custom, ParseOptions::for_non_portable())?;
                    let data = data.manual_fingerprints(HashMap::new());
                    uvw.put_person_data(conn, data)?;
                }

                Ok(())
            })
            .await?;
    }

    Ok(())
}
